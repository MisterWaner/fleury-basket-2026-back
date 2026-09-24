import * as fs from "node:fs/promises";
import * as path from "node:path";

import { scrapeRanking } from "./rankingScraper.js";
import { scrapeMatches } from "./matchScraper.js";

export async function testScraper() {
    try {
        const url =
            "https://competitions.ffbb.com/ligues/nor/comites/0014/clubs/nor0014086/equipes/200000005379029/classement";

        const res = await scrapeRanking(url);

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





