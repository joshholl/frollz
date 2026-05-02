import type { FilmSummary } from '@frollz2/schema';

type CostFields = Pick<FilmSummary, 'purchaseCostAllocated' | 'developmentCost'>;

export function useFilmCostFormatting() {
  function formatCost(cost: { amount: number; currencyCode: string } | null | undefined): string {
    if (!cost) return 'Not recorded';
    return `${cost.currencyCode} ${cost.amount.toFixed(2)}`;
  }

  function formatKnownCost(film: CostFields): string {
    const purchase = film.purchaseCostAllocated;
    const development = film.developmentCost;
    if (!purchase && !development) return 'Not recorded';

    if (purchase && development && purchase.currencyCode === development.currencyCode) {
      return formatCost({ amount: purchase.amount + development.amount, currencyCode: purchase.currencyCode });
    }
    if (purchase && development) {
      return `${formatCost(purchase)} + ${formatCost(development)}`;
    }
    return formatCost(purchase ?? development);
  }

  return { formatCost, formatKnownCost };
}
