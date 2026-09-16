import { Module } from '@nestjs/common';
import { SanityService } from './services/sanity.service';

@Module({
  providers: [SanityService],
  exports: [SanityService],
})
export class SanityIntegrationModule {}
