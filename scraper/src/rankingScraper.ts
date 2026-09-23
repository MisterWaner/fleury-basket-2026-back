import * as cheerio from "cheerio";
import type { ScrapedRanking } from "./types.js";

const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export async function scrapeRanking(
    url: string,
): Promise<ScrapedRanking[]> {
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) {
        throw new Error(
            `Erreur HTTP (${response.status}) lors du chargement du classement : ${url}`,
        );
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const rankings: ScrapedRanking[] = [];

    // Ajoutez ici la logique pour extraire le classement à partir du HTML

    return rankings;
}