import { Module } from '@nestjs/common';
import { LinkedInService } from './services/linkedin.service';

@Module({
  providers: [LinkedInService],
  exports: [LinkedInService],
})
export class LinkedInIntegrationModule {}
