import * as cheerio from "cheerio";
import type { ScrapedMatch } from "./types.js";

const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export async function scrapeMatches(
    url: string,
    currentTeamName: string = "FLEURY SUR ORNE BASKET",
): Promise<ScrapedMatch[]> {
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) {
        throw new Error(
            `Erreur HTTP (${response.status}) lors du chargement des matchs : ${url}`,
        );
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const matches: ScrapedMatch[] = [];

    $('[data-onboarding="team"] > div > div.bg-white').each((_, element) => {
        const $row = $(element);

        // 1. Info de la rencontre
        const matchNumber =
            $row
                .find(".font-AgencyFBBlackComp")
                .eq(0)
                .text()
                .trim()
                .replace("#", "") || undefined;

        const infoDivs = $row.find(".flex.gap-1.items-center > div");
        const rawDate = infoDivs.eq(2).text().trim(); // Ex: "27 sept. 12h00"
        const locationText = infoDivs.eq(3).text().trim().toLowerCase(); // "domicile" ou "extérieur"
        const isHome = locationText === "domicile";

        // 2. Nom de l'adversaire
        const $opponentLink = $row.find('a[href*="/clubs/"]');
        const opponentName =
            $opponentLink.find("div.line-clamp-2").text().trim() ||
            $opponentLink.attr("title") ||
            "Inconnu";

        // Assignation Domicile / Extérieur
        const homeTeam = isHome ? currentTeamName : opponentName;
        const awayTeam = isHome ? opponentName : currentTeamName;

        // 3. Extraction des scores
        const $matchLink = $row.find('a[href*="/match/"]');
        const scoreSpans = $matchLink.find("span");

        const parsedHomeScore = parseInt(scoreSpans.eq(0).text().trim(), 10);
        const parsedAwayScore = parseInt(scoreSpans.eq(1).text().trim(), 10);

        const homeScore = !isNaN(parsedHomeScore) ? parsedHomeScore : null;
        const awayScore = !isNaN(parsedAwayScore) ? parsedAwayScore : null;

        matches.push({
            ...(matchNumber !== undefined ? { matchNumber } : {}),
            date: rawDate,
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
        });
    });
    return matches;
}

