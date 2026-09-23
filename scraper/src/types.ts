export interface ScrapedMatch {
    matchNumber?: string;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
}

export interface ScrapedRanking {
    position: number;
    teamName: string;
    points: number;
    played: number;
    won: number;
    lost: number;
    drawn: number;
    pointsFor: number;
    pointsAgainst: number;
    diff: number;
}