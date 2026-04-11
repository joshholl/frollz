// Helpers — derive current state name from Film.states
export function currentStateName(film) {
    if (!film.states?.length)
        return '';
    const sorted = [...film.states].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0]?.state?.name ?? '';
}
