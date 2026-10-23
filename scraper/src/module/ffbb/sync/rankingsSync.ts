import { writeFile } from "fs/promises";
import path from "path";
import type PocketBase from "pocketbase";
import { scrapeRanking } from "../scrapers/rankingScraper.js";

export async function syncRankingToPocketBase(
    pb: PocketBase,
    teamRefId: string,
    teamKey: string,
    rankingURL: string,
    backupDir: string,
) {
    try {
        console.log(`[Classement] Scraping en cours...`);
        const rankings = await scrapeRanking(rankingURL);

        // 1. Local backup of the scraped ranking
        const backupFilePath = path.join(
            backupDir,
            `classement_${teamKey.toLowerCase()}_latest.json`,
        );
        await writeFile(backupFilePath, JSON.stringify(rankings, null, 2));
        
        console.log(`[Classement] Backup completed for team: ${teamKey}`);

        // // 2. Sync the ranking to PocketBase
        for (const item of rankings) {
            const isCurrentTeam = item.teamName
                .toUpperCase()
                .includes("FLEURY");

            // unique key for the ranking record
            const rankCustomKey =
                `${teamKey}_pos_${item.position}`.toLowerCase();

            const data = {
                team_ref: teamRefId,
                position: item.position,
                team: item.teamName,
                played: item.gamesPlayed,
                won: item.won,
                lost: item.lost,
                points: item.points,
                pointsFor: item.pointsFor,
                pointsAgainst: item.pointsAgainst,
                pointsDiff: item.pointsDiff,
                isCurrentTeam,
                updateAtFFBB: new Date().toISOString(),
            };

            const existingRecord = await pb
                .collection("rankings")
                .getFirstListItem(
                    `team_ref="${teamRefId}" && position=${item.position}`,
                )
                .catch(() => null);

            if (existingRecord) {
                await pb.collection("rankings").update(existingRecord.id, data);
                console.log(
                    `[Classement] Updated ranking for team: ${teamKey}, position: ${item.position}`,
                );
            } else {
                await pb.collection("rankings").create(data);
                console.log(
                    `[Classement] Created ranking for team: ${teamKey}, position: ${item.position}`,
                );
            }
        }
        console.log(
            `✓ Classement (${rankings.length} lignes) synchronisé pour ${teamKey}.`,
        );
    } catch (error) {
        console.error(
            `[Classement] Error syncing ranking for team: ${teamKey}`,
            error,
        );
    }
}

