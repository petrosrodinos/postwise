import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { OwnershipService } from './ownership.service';

@Module({
  imports: [PrismaModule],
  providers: [OwnershipService],
  exports: [OwnershipService],
})
export class OwnershipModule {}
