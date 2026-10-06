import { mkdir } from "fs/promises";
import path from "path";
import PocketBase from "pocketbase";
import { syncRankingToPocketBase } from "./rankingsSync.js";
import { syncMatchesToPocketBase } from "./matchesSync.js";


import type { TeamRecord } from "./types.js";

// Connexion à PocketBase
const pb = new PocketBase(
    process.env.POCKETBASE_URL || "http://127.0.0.1:8090",
);

async function run() {
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const backupDir = path.join(process.cwd(), "data", "backups");
    await mkdir(backupDir, { recursive: true });

    // Authentification à PocketBase
    if (
        process.env.POCKETBASE_ADMIN_EMAIL &&
        process.env.POCKETBASE_ADMIN_PASSWORD
    ) {
        await pb
            .collection("_superusers")
            .authWithPassword(
                process.env.POCKETBASE_ADMIN_EMAIL,
                process.env.POCKETBASE_ADMIN_PASSWORD,
            );
    }

    // 1. Récupération dynamique des équipes depuis PocketBase
    console.log(
        "Chargement de la configuration des équipes depuis PocketBase...",
    );
    
    const teams: TeamRecord[] = await pb.collection("competitions").getFullList<TeamRecord>({
        filter: `activeScraping=true`,
    });
    

    if (teams.length === 0) {
        console.log("Aucune équipe active trouvée dans PocketBase.");
        return;
    }

    // 2. Exécution
    for (const team of teams) {
        if(!team.calendarUrl && !team.rankingUrl) continue;


        console.log(`\n=== Traitement : ${team.teamKey} ===`);

        // A. Calendar
        if (team.calendarUrl) {
            await syncMatchesToPocketBase(pb, team.teamKey, team.calendarUrl, backupDir, timestamp);
        }

        // B. Ranking
        if (team.rankingUrl) {
            await syncRankingToPocketBase(pb, team.teamKey, team.rankingUrl, backupDir, timestamp);
        }
    }
}

run();

