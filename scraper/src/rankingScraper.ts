import { chromium } from "playwright";
import type { ScrapedRanking } from "./types.js";

export async function scrapeRanking(url: string): Promise<ScrapedRanking[]> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        locale: "fr-FR",
    });

    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

        // Attente du tableau de classement dans le DOM
        await page.waitForSelector("tbody tr", { timeout: 15000 }).catch(() => {
            console.warn("Tableau de classement non trouvé à temps.");
        });

        // Extraction directe depuis le DOM Chromium
        const rankings = await page.evaluate(() => {
            const results: any[] = [];
            const rows = Array.from(document.querySelectorAll("tbody tr"));

            for (const row of rows) {
                const tds = Array.from(row.querySelectorAll("td"));
                if (tds.length < 4) continue;

                // 1. Rang & logo (Cellule 0)
                const positionText =
                    tds[0]?.querySelector("span")?.textContent?.trim() ||
                    tds[0]?.textContent?.trim() ||
                    "";
                const position = parseInt(positionText, 10);
                const logoUrl =
                    tds[0]?.querySelector("img")?.getAttribute("src") || "";

                // 2. Nom de l'équipe (Cellule 1)
                const teamName = tds[1]?.textContent?.trim() || "";

                // 3. Points au classement (Cellule 2)
                const points =
                    parseInt(tds[2]?.textContent?.trim() || "0", 10) || 0;

                // 4. Rencontres : J, G, P, N, Incomplets, Pénalités, Forfaits, Défaites par pénalité
                const matchesDivs = Array.from(
                    tds[3]?.querySelectorAll("div.flex > div") || [],
                );
                const gamesPlayed =
                    parseInt(matchesDivs[0]?.textContent?.trim() || "0", 10) ||
                    0;
                const won =
                    parseInt(matchesDivs[1]?.textContent?.trim() || "0", 10) ||
                    0;
                const lost =
                    parseInt(matchesDivs[2]?.textContent?.trim() || "0", 10) ||
                    0;
                const drawn =
                    parseInt(matchesDivs[3]?.textContent?.trim() || "0", 10) ||
                    0;

                const incomplete =
                    parseInt(matchesDivs[4]?.textContent?.trim() || "0", 10) ||
                    0;
                const penalties =
                    parseInt(matchesDivs[5]?.textContent?.trim() || "0", 10) ||
                    0;
                const forfeits =
                    parseInt(matchesDivs[6]?.textContent?.trim() || "0", 10) ||
                    0;
                const defeatsByPenalties =
                    parseInt(matchesDivs[7]?.textContent?.trim() || "0", 10) ||
                    0;

                // 5. Points panier : Marqués, Encaissés, Différence (Dernière cellule flex)
                const scoreCell = tds[tds.length - 1];
                const scoreDivs = Array.from(
                    scoreCell?.querySelectorAll("div.flex > div") || [],
                );
                const pointsFor =
                    parseInt(scoreDivs[0]?.textContent?.trim() || "0", 10) || 0;
                const pointsAgainst =
                    parseInt(scoreDivs[1]?.textContent?.trim() || "0", 10) || 0;
                const pointsDiff =
                    parseInt(scoreDivs[2]?.textContent?.trim() || "0", 10) || 0;

                if (teamName && !isNaN(position)) {
                    results.push({
                        position,
                        teamName,
                        logoUrl,
                        points,
                        gamesPlayed,
                        won,
                        lost,
                        drawn,
                        incomplete,
                        penalties,
                        forfeits,
                        defeatsByPenalties,
                        pointsFor,
                        pointsAgainst,
                        pointsDiff,
                    });
                }
            }

            return results;
        });

        await browser.close();
        return rankings;
    } catch (error) {
        await browser.close();
        throw error;
    }
}
