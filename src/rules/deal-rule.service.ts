import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DealCandidate {
  currentPrice: number;
  historicalAverage: number;
  rating: number | null;
}

export interface DealDecision {
  approved: boolean;
  discountPercent: number;
  reasons: string[];
}

@Injectable()
export class DealRuleService {
  constructor(private readonly config: ConfigService) {}

  evaluate(candidate: DealCandidate): DealDecision {
    const minDiscount = Number(this.config.get('MIN_DISCOUNT_PERCENT', 15));
    const maxPrice = Number(this.config.get('MAX_PRICE_BRL', 1000));
    const minRating = Number(this.config.get('MIN_RATING', 4.5));
    const discountPercent = candidate.historicalAverage > 0
      ? ((candidate.historicalAverage - candidate.currentPrice) / candidate.historicalAverage) * 100
      : 0;
    const reasons: string[] = [];

    if (discountPercent < minDiscount) reasons.push(`desconto menor que ${minDiscount}%`);
    if (candidate.currentPrice > maxPrice) reasons.push(`preço acima de R$ ${maxPrice}`);
    if (candidate.rating === null || candidate.rating < minRating) reasons.push(`avaliação menor que ${minRating}`);

    return { approved: reasons.length === 0, discountPercent: Number(discountPercent.toFixed(2)), reasons };
  }
}
