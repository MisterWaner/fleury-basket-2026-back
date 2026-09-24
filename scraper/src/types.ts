export interface ScrapedMatch {
    matchNumber?: string;
    day?: string;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
}

export interface ScrapedRanking {
    position: number;
    teamName: string;
    logoUrl: string;
    points: number;
    gamesPlayed: number;
    won: number;
    lost: number;
    drawn: number;
    incomplete: number;
    penalties: number;
    forfeits: number;
    defeatsByPenalties: number;
    pointsFor: number;
    pointsAgainst: number;
    pointsDiff: number;
}