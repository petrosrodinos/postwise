import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InternalAiService } from './ai.service';
import { CreateAiDto } from './dto/create-ai.dto';
import { Roles } from '@/shared/decorators/roles.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AuthRoles } from 'src/modules/auth/interfaces/auth.interface';

@Controller('ai')
@UseGuards(JwtGuard, RolesGuard)
@Roles(AuthRoles.ADMIN)
export class AiController {
  constructor(private readonly aiService: InternalAiService) { }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() createAiDto: CreateAiDto) {
    return this.aiService.create(userId, createAiDto);
  }


}
