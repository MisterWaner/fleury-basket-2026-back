export function isMatchPassed(dateStr: string): boolean {
    if (!dateStr || dateStr === "N/A") return false;

    // Normalisation : minuscules et suppression des accents/points
    const cleanStr = dateStr
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\./g, "");

    // Mapping des mois nettoyés
    const monthsMap: Record<string, number> = {
        janv: 0,
        jan: 0,
        fevr: 1,
        fev: 1,
        mars: 2,
        mar: 2,
        avril: 3,
        avr: 3,
        mai: 4,
        juin: 5,
        juil: 6,
        jui: 6,
        aout: 7,
        sept: 8,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
    };

    // Cherche un nombre (le jour) suivi du nom du mois n'importe où dans la chaîne
    const regex =
        /(\d{1,2})\s*(janv|jan|fevr|fev|mars|mar|avril|avr|mai|juin|juil|jui|aout|sept|sep|oct|nov|dec)/i;
    const match = cleanStr.match(regex);

    if (!match) return false;

    const day = parseInt(match[1]!, 10);
    const month = monthsMap[match[2]!];

    if (month === undefined) return false;

    // Année courante (2026)
    const now = new Date();
    let year = now.getFullYear();

    // Logique de saison sportive (Septembre - Juin)
    if (now.getMonth() < 6 && month >= 8) {
        year -= 1;
    } else if (now.getMonth() >= 8 && month < 6) {
        year += 1;
    }

    // On fixe l'heure à 23h59 le jour du match pour ne marquer le match "FINISHED" qu'une fois la journée terminée
    const matchDate = new Date(year, month, day, 23, 59, 59);

    return matchDate < now;
}
