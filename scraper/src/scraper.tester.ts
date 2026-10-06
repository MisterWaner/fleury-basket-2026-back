import * as fs from "node:fs/promises";
import * as path from "node:path";

import { TEAMS_URLS } from "./module/ffbb/urls.js";
import { scrapeRanking } from "./rankingScraper.js";
import { scrapeMatches } from "./matchScraper.js";

export async function testScraper() {
    try {
        const url = TEAMS_URLS["SENIORS"]?.calendarUrl;

        if (!url) {
            throw new Error("URL du calendrier introuvable pour l'équipe SENIORS");
        }

        const res = await scrapeMatches(url);

        // Option A : Option recommandée - Fichier JSON bien formaté (indentation 2 espaces)
        const jsonPath = path.join(process.cwd(), "calendrier.json");
        await fs.writeFile(jsonPath, JSON.stringify(res, null, 2), "utf-8");
        console.log(` Données sauvegardées en JSON dans : ${jsonPath}`);

        // Option B : Fichier TXT brut (si besoin)
        const txtPath = path.join(process.cwd(), "calendrier.txt");
        

        await fs.writeFile(txtPath, JSON.stringify(res, null, 2), "utf-8");
        console.log(` Données sauvegardées en TXT dans : ${txtPath}`);
    } catch (error) {
        console.error("Erreur lors du scraping :", error);
    }
}

testScraper();





