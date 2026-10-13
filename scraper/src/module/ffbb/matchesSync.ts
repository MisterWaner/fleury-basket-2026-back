import { writeFile } from "fs/promises";
import path from "path";
import type PocketBase from "pocketbase";
import { scrapeMatches } from "./matchScraper.js";
import { isMatchPassed } from "../../helpers/isMatchPassed.js";

export async function syncMatchesToPocketBase(
    pb: PocketBase,
    competitionId: string,
    teamKey: string,
    calendarURL: string,
    backupDir: string,
    timestamp: string,
) {
    try {
        console.log(`[Calendrier] Scraping en cours...`);
        const matches = await scrapeMatches(
            calendarURL,
            "FLEURY SUR ORNE BASKET",
        );

        // 1. Local backup of the scraped matches
        await writeFile(
            `./data/calendrier_${teamKey.toLowerCase()}_latest.json`,
            JSON.stringify(matches, null, 2),
        );
        await writeFile(
            path.join(
                backupDir,
                `calendrier_${teamKey.toLowerCase()}_${timestamp}.json`,
            ),
            JSON.stringify(matches, null, 2),
        );
        console.log(`[Calendrier] Backup completed for team: ${teamKey}`);

        // 2. Sync the matches to PocketBase
        for (const match of matches) {
            const customId =
                `${teamKey}_${match.day || "J0"}_${match.matchNumber || "0"}`
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, "_");

            const isHome = Boolean(
                match.homeTeam &&
                match.homeTeam.toUpperCase().includes("FLEURY"),
            );
            const opponent = isHome ? match.awayTeam : match.homeTeam;

            const isPassed = isMatchPassed(match.date || "N/A");
            const status = isPassed ? "FINISHED" : "SCHEDULED";
            console.log(
                `[DEBUG] Date reçue: "${match.date}" | Scores: ${match.homeScore}-${match.awayScore}`,
            );
            const data = {
                team: competitionId,
                customId,
                matchNumber: match.matchNumber,
                day: match.day,
                date: match.date || "N/A",
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                homeScore: match.homeScore,
                awayScore: match.awayScore,
                isHome: isHome,
                opponent,
                status: status,
                updateAtFFBB: new Date().toISOString(),
            };

            const existingRecord = await pb
                .collection("matches")
                .getFirstListItem(`customId="${customId}"`)
                .catch(() => null);

            if (existingRecord) {
                await pb.collection("matches").update(existingRecord.id, data);
                console.log(`[Matches] Updated match ${customId}`);
            } else {
                await pb.collection("matches").create(data);
                console.log(`[Matches] Created match ${customId}`);
            }
        }
        console.log(`[Calendrier] Sync completed for team: ${teamKey}`);
    } catch (error) {
        console.error(`Error syncing matches for team: ${teamKey}`, error);
        if (error && typeof error === "object" && "response" in error) {
            console.log(
                (error as { response?: { data?: unknown } }).response?.data,
            );
        }
    }
}



