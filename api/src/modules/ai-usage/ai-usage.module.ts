import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { AiUsageController } from './ai-usage.controller';
import { AiUsageService } from './ai-usage.service';

@Module({
  imports: [PrismaModule, OwnershipModule],
  controllers: [AiUsageController],
  providers: [AiUsageService],
  exports: [AiUsageService],
})
export class AiUsageModule {}
