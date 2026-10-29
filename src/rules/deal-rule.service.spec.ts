import { ConfigService } from '@nestjs/config';
import { DealRuleService } from './deal-rule.service';

describe('DealRuleService', () => {
  const config = new ConfigService({ MIN_DISCOUNT_PERCENT: 15, MAX_PRICE_BRL: 1000, MIN_RATING: 4.5 });
  const service = new DealRuleService(config);

  it('aprova oferta que atende a todas as regras', () => {
    expect(service.evaluate({ currentPrice: 850, historicalAverage: 1000, rating: 4.5 })).toEqual({
      approved: true,
      discountPercent: 15,
      reasons: [],
    });
  });

  it('reprova quando qualquer critério falha', () => {
    const result = service.evaluate({ currentPrice: 1100, historicalAverage: 1200, rating: 4.4 });
    expect(result.approved).toBe(false);
    expect(result.reasons).toHaveLength(3);
  });
});
