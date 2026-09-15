import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { GcsIntegrationModule } from '@/integrations/storage/gcs/gcs.module';
import { OwnershipModule } from '@/shared/services/ownership/ownership.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [PrismaModule, GcsIntegrationModule, OwnershipModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
