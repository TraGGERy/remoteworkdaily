/**
 * Bounded Context: Monetization & Billing
 * Pricing engine, add-on calculations, and payment rail dispatching for Remote Work Daily.
 */

export type PaymentRailType = "stripe_card" | "plaid_ach";

export interface IAddOnSelections {
  sticky?: boolean;
  highlight?: boolean;
  newsletterBlast?: boolean;
  companyLogo?: boolean;
}

export const MONETIZATION_RATES = {
  BASE_POSTING_USD: 249,
  STICKY_24H_USD: 89,
  HIGHLIGHT_YELLOW_USD: 49,
  NEWSLETTER_BLAST_USD: 99,
  SHOW_COMPANY_LOGO_USD: 39,
} as const;

export class PostingPricingEngine {
  static calculateTotal(addOns: IAddOnSelections = {}): {
    subtotal: number;
    breakdown: Array<{ name: string; amount: number }>;
  } {
    const breakdown: Array<{ name: string; amount: number }> = [
      { name: "30-Day Verified Remote Job Listing", amount: MONETIZATION_RATES.BASE_POSTING_USD },
    ];

    let total = MONETIZATION_RATES.BASE_POSTING_USD;

    if (addOns.sticky) {
      breakdown.push({ name: "Sticky Pin to Top (24h)", amount: MONETIZATION_RATES.STICKY_24H_USD });
      total += MONETIZATION_RATES.STICKY_24H_USD;
    }

    if (addOns.highlight) {
      breakdown.push({ name: "Yellow Highlight Badge", amount: MONETIZATION_RATES.HIGHLIGHT_YELLOW_USD });
      total += MONETIZATION_RATES.HIGHLIGHT_YELLOW_USD;
    }

    if (addOns.newsletterBlast) {
      breakdown.push({ name: "Remote Work Daily Newsletter Blast (120k+ Readers)", amount: MONETIZATION_RATES.NEWSLETTER_BLAST_USD });
      total += MONETIZATION_RATES.NEWSLETTER_BLAST_USD;
    }

    if (addOns.companyLogo) {
      breakdown.push({ name: "Prominent Company Logo Placement", amount: MONETIZATION_RATES.SHOW_COMPANY_LOGO_USD });
      total += MONETIZATION_RATES.SHOW_COMPANY_LOGO_USD;
    }

    return {
      subtotal: total,
      breakdown,
    };
  }
}
