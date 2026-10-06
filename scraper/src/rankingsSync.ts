import { writeFile } from "fs/promises";
import path from "path";
import type PocketBase from "pocketbase";
import { scrapeRanking } from "./rankingScraper.js";

export async function syncRankingToPocketBase(
    pb: PocketBase,
    teamKey: string,
    rankingUrl: string,
    backupDir: string,
    timestamp: string,
) {
    try {
        console.log(`[Classement] Scraping en cours...`);
        const rankings = await scrapeRanking(rankingUrl);

        // 1. Local backup of the scraped ranking
        await writeFile(
            `./data/classement_${teamKey.toLowerCase()}_latest.json`,
            JSON.stringify(rankings, null, 2),
        );
        await writeFile(
            path.join(
                backupDir,
                `classement_${teamKey.toLowerCase()}_${timestamp}.json`,
            ),
            JSON.stringify(rankings, null, 2),
        );
        console.log(`[Classement] Backup completed for team: ${teamKey}`);

        // 2. Sync the ranking to PocketBase
        const existingRecord = await pb
            .collection("rankings")
            .getFirstListItem(`teamKey="${teamKey}"`)
            .catch(() => null);

        const payload = {
            teamKey,
            data:rankings,
            updateAtFFBB: new Date().toISOString(),
        }; 


        if (existingRecord) {
            await pb.collection("rankings").update(existingRecord.id, payload);
        } else {
            await pb.collection("rankings").create(payload);
        }
        console.log(`[Classement] Sync completed for team: ${teamKey}`);
    } catch (error) {
        console.error(`[Classement] Error syncing ranking for team: ${teamKey}`, error);
    }
}