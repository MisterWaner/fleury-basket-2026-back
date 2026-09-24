import { chromium } from "playwright";
import type { ScrapedMatch } from "./types.js";

export async function scrapeMatches(
    url: string,
    currentTeamName: string = "FLEURY SUR ORNE BASKET",
): Promise<ScrapedMatch[]> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        locale: "fr-FR",
    });

    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

        // 1. Attente active de l'affichage des liens vers les matchs
        await page
            .waitForSelector('a[href*="/match/"]', { timeout: 15000 })
            .catch(() => {
                console.warn(
                    "L'élément a[href*='/match/'] n'a pas été trouvé à temps.",
                );
            });

        // 2. Extraction directe des données depuis le DOM du navigateur
        const matches = await page.evaluate((teamName) => {
            const results: any[] = [];

            // On cible directement les cartes de chaque match
            const cards = Array.from(document.querySelectorAll("div.bg-white"));

            for (const card of cards) {
                // Vérification qu'il s'agit bien d'une carte de match (doit contenir un lien vers /match/)
                const matchLink = card.querySelector('a[href*="/match/"]');
                if (!matchLink) continue;

                // 1. Numéro de match (#11)
                const matchNumEl = card.querySelector(
                    ".font-AgencyFBBlackComp",
                );
                const matchNumber =
                    matchNumEl?.textContent?.trim().replace("#", "") ||
                    undefined;

                // 2. Journée (J1, J2...)
                // Ciblage spécifique du div contenant l'uppercase (ex: J1)
                const dayEl = card.querySelector(".uppercase");
                const dayText = dayEl?.textContent?.trim();
                const dayMatch =
                    dayText?.match(/J\d+/i) ||
                    card.textContent?.match(/\bJ\d+\b/i);
                const day = dayMatch ? dayMatch[0].toUpperCase() : undefined;

                // 3. Date ("1 nov. 10h00")
                const dateEl = card.querySelector(".text-\\[\\#8A8FA2\\]");
                let rawDate = dateEl?.textContent?.trim() || "";

                // Fallback regex si le sélecteur de classe varie
                if (!rawDate) {
                    const fullText = (card.textContent || "").replace(
                        /\s+/g,
                        " ",
                    );
                    const dateMatch = fullText.match(
                        /\d{1,2}\s+(?:janv|févr|mars|avril|mai|juin|juil|août|sept|oct|nov|déc)\.?(?:\s+\d{1,2}h\d{2})?/i,
                    );
                    rawDate = dateMatch ? dateMatch[0].trim() : "";
                }

                // 4. Domicile / Extérieur
                const isHome =
                    card.textContent?.toLowerCase().includes("domicile") ??
                    false;

                // 5. Adversaire
                const opponentLink = card.querySelector('a[href*="/clubs/"]');
                const opponentName =
                    opponentLink?.getAttribute("title")?.trim() ||
                    opponentLink?.querySelector("div")?.textContent?.trim() ||
                    "Adversaire inconnu";

                // 6. Scores (0 - 0)
                const scoreSpans = Array.from(
                    matchLink.querySelectorAll("span"),
                );
                const scores = scoreSpans
                    .map((span) => parseInt(span.textContent?.trim() || "", 10))
                    .filter((val) => !isNaN(val));

                results.push({
                    ...(matchNumber ? { matchNumber } : {}),
                    ...(day ? { day } : {}),
                    date: rawDate,
                    homeTeam: isHome ? teamName : opponentName,
                    awayTeam: isHome ? opponentName : teamName,
                    homeScore: scores.length >= 2 ? scores[0] : null,
                    awayScore: scores.length >= 2 ? scores[1] : null,
                });
            }

            return results;
        }, currentTeamName);
        
        await browser.close();
        return matches;
    } catch (error) {
        await browser.close();
        throw error;
    }
}



