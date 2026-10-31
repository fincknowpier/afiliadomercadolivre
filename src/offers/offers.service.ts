import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DealRuleService } from '../rules/deal-rule.service';
import { Offer } from './offer.entity';
import { OfferPriceHistory } from './offer-price-history.entity';

export interface OfferInput {
  titulo: string;
  categoria: string;
  preco_atual: number | string;
  preco_anterior: number | string;
  avaliacao: number | string;
  url_produto: string;
  url_afiliado: string;
}

const ALLOWED_CATEGORIES = ['Eletrônicos', 'Esportes e fitness', 'Casa e cozinha'];

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private readonly offers: Repository<Offer>,
    @InjectRepository(OfferPriceHistory) private readonly prices: Repository<OfferPriceHistory>,
    private readonly rules: DealRuleService,
  ) {}

  async list(): Promise<Offer[]> {
    return this.offers.find({ order: { updatedAt: 'DESC' }, take: 200 });
  }

  async import(rows: OfferInput[]) {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new BadRequestException('Envie ao menos uma oferta.');
    }
    if (rows.length > 500) throw new BadRequestException('O limite é de 500 ofertas por importação.');

    const results = [];
    for (let index = 0; index < rows.length; index += 1) {
      const input = rows[index];
      const errors = this.validate(input);
      if (errors.length) {
        results.push({ line: index + 2, imported: false, errors });
        continue;
      }

      const currentPrice = this.number(input.preco_atual);
      const referencePrice = this.number(input.preco_anterior);
      const rating = this.number(input.avaliacao);
      const decision = this.rules.evaluate({ currentPrice, historicalAverage: referencePrice, rating });
      const existing = await this.offers.findOneBy({ productUrl: input.url_produto.trim() });
      const previousCurrentPrice = existing ? Number(existing.currentPrice) : undefined;
      const offer = this.offers.create({
        ...(existing ?? {}),
        title: input.titulo.trim(),
        category: input.categoria.trim(),
        currentPrice,
        referencePrice,
        rating,
        productUrl: input.url_produto.trim(),
        affiliateUrl: input.url_afiliado.trim(),
        approved: decision.approved,
        discountPercent: decision.discountPercent,
        rejectionReasons: decision.reasons,
      });
      const saved = await this.offers.save(offer);
      if (previousCurrentPrice === undefined || previousCurrentPrice !== currentPrice) {
        await this.prices.save(this.prices.create({ offerId: saved.id, price: currentPrice }));
      }
      results.push({
        line: index + 2,
        imported: true,
        id: saved.id,
        approved: saved.approved,
        discountPercent: Number(saved.discountPercent),
        reasons: saved.rejectionReasons,
      });
    }
    return {
      total: rows.length,
      imported: results.filter((result) => result.imported).length,
      approved: results.filter((result) => result.imported && result.approved).length,
      rejected: results.filter((result) => result.imported && !result.approved).length,
      invalid: results.filter((result) => !result.imported).length,
      results,
    };
  }

  async update(
    id: string,
    input: { preco_atual: number | string; preco_anterior: number | string; url_afiliado?: string },
  ) {
    const offer = await this.offers.findOneBy({ id });
    if (!offer) throw new NotFoundException('Oferta não encontrada.');

    const currentPrice = this.number(input.preco_atual);
    const referencePrice = this.number(input.preco_anterior);
    if (!(currentPrice > 0)) throw new BadRequestException('Preço atual inválido.');
    if (!(referencePrice > 0)) throw new BadRequestException('Preço anterior inválido.');
    if (input.url_afiliado !== undefined && !this.isUrl(input.url_afiliado)) {
      throw new BadRequestException('URL de afiliado inválida.');
    }

    const priceChanged = Number(offer.currentPrice) !== currentPrice;
    const decision = this.rules.evaluate({
      currentPrice,
      historicalAverage: referencePrice,
      rating: Number(offer.rating),
    });
    offer.currentPrice = currentPrice;
    offer.referencePrice = referencePrice;
    if (input.url_afiliado !== undefined) offer.affiliateUrl = input.url_afiliado.trim();
    offer.approved = decision.approved;
    offer.discountPercent = decision.discountPercent;
    offer.rejectionReasons = decision.reasons;
    const saved = await this.offers.save(offer);

    if (priceChanged) {
      await this.prices.save(this.prices.create({ offerId: saved.id, price: currentPrice }));
    }
    return saved;
  }

  async priceHistory(id: string) {
    if (!await this.offers.existsBy({ id })) throw new NotFoundException('Oferta não encontrada.');
    return this.prices.find({
      where: { offerId: id },
      order: { recordedAt: 'DESC' },
      take: 10,
    });
  }

  private validate(input: OfferInput): string[] {
    const errors: string[] = [];
    if (!input?.titulo?.trim()) errors.push('título obrigatório');
    if (!ALLOWED_CATEGORIES.includes(input?.categoria?.trim())) errors.push('categoria inválida');
    if (!(this.number(input?.preco_atual) > 0)) errors.push('preço atual inválido');
    if (!(this.number(input?.preco_anterior) > 0)) errors.push('preço anterior inválido');
    const rating = this.number(input?.avaliacao);
    if (!(rating >= 0 && rating <= 5)) errors.push('avaliação deve estar entre 0 e 5');
    if (!this.isUrl(input?.url_produto)) errors.push('URL do produto inválida');
    if (!this.isUrl(input?.url_afiliado)) errors.push('URL de afiliado inválida');
    return errors;
  }

  private number(value: number | string): number {
    return Number(String(value ?? '').replace(',', '.'));
  }

  private isUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
