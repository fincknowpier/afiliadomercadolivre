import { Module } from '@nestjs/common';
import { DealRuleService } from './deal-rule.service';

@Module({ providers: [DealRuleService], exports: [DealRuleService] })
export class RulesModule {}
