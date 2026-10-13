import { writeFile } from "fs/promises";
import path from "path";
import type PocketBase from "pocketbase";
import { scrapeRanking } from "./rankingScraper.js";

export async function syncRankingToPocketBase(
    pb: PocketBase,
    teamRefId: string,
    teamKey: string,
    rankingURL: string,
    backupDir: string,
    timestamp: string,
) {
    try {
        console.log(`[Classement] Scraping en cours...`);
        const rankings = await scrapeRanking(rankingURL);

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

        // // 2. Sync the ranking to PocketBase
        for (const rank of rankings) {
            const isCurrentTeam = rank.teamName
                .toUpperCase()
                .includes("FLEURY");

            // unique key for the ranking record
            const rankCustomKey =
                `${teamKey}_pos_${rank.position}`.toLowerCase();

            const data = {
                team_ref: teamRefId,
                position: rank.position,
                team: rank.teamName,
                played: rank.gamesPlayed,
                won: rank.won,
                lost: rank.lost,
                points: rank.points,
                isCurrentTeam,
                updateAtFFBB: new Date().toISOString(),
            };

            const existingRecord = await pb
                .collection("rankings")
                .getFirstListItem(
                    `team_ref="${teamRefId}" && position=${rank.position}`,
                )
                .catch(() => null);

            if (existingRecord) {
                await pb.collection("rankings").update(existingRecord.id, data);
                console.log(`[Classement] Updated ranking for team: ${teamKey}, position: ${rank.position}`);
            } else {
                await pb.collection("rankings").create(data);
                console.log(`[Classement] Created ranking for team: ${teamKey}, position: ${rank.position}`);
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

