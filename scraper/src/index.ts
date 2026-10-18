import { mkdir } from "fs/promises";
import { config } from "dotenv";
import path from "path";
import PocketBase from "pocketbase";
import { syncRankingToPocketBase } from "./module/ffbb/rankingsSync.js";
import { syncMatchesToPocketBase } from "./module/ffbb/matchesSync.js";

import type { TeamRecord } from "./types.js";

// Connexion à PocketBase
config(); // Load environment variables from .env file
const pb = new PocketBase(
    process.env.POCKETBASE_URL || "http://127.0.0.1:8090",
);

async function run() {
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const backupDir = path.join(process.cwd(), "data", "backups");
    await mkdir(backupDir, { recursive: true });

    // Authentification à PocketBase
    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error(
            "Les informations d'authentification du superutilisateur ne sont pas définies dans les variables d'environnement.",
        );
        return;
    }

    try {
        await pb.collection("_superusers").authWithPassword(email, password);

        console.log(
            "Auth Superuser réussie ! Token valide :",
            pb.authStore.isValid,
        );
    } catch (error) {
        console.error(
            "Erreur lors de l'authentification du superutilisateur :",
            error,
        );
        return; // Stop execution if authentication fails
    }

    // 1. Récupération dynamique des équipes depuis PocketBase
    console.log(
        "Chargement de la configuration des équipes depuis PocketBase...",
    );

    const competitions: TeamRecord[] = await pb
        .collection("competitions")
        .getFullList<TeamRecord>({
            filter: `activeScraping=true`,
        });

    if (competitions.length === 0) {
        console.log("Aucune équipe active trouvée dans PocketBase.");
        return;
    }

    // 2. Exécution
    for (const comp of competitions) {
        if (!comp.calendarURL && !comp.rankingURL && !comp.activeScraping)
            continue;

        if (!comp.team) {
            console.error(
                `⚠️ La compétition ${comp.teamKey} n'a pas d'équipe (team) associée dans PocketBase !`,
            );
            continue;
        }

        console.log(`\n=== Traitement : ${comp.teamKey} ===`);

        // A. Calendar
        if (comp.calendarURL) {
            await syncMatchesToPocketBase(
                pb,
                comp.team,
                comp.teamKey,
                comp.calendarURL,
                backupDir,
                timestamp,
            );
        }

        // B. Ranking
        if (comp.rankingURL) {
            await syncRankingToPocketBase(
                pb,
                comp.team,
                comp.teamKey,
                comp.rankingURL,
                backupDir,
                timestamp,
            );
        }
    }
}

run();

