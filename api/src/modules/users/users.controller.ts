import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserEntity } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: "Get the current user's profile" })
  @ApiResponse({ status: 200, type: UserEntity })
  me(@CurrentUser('id') userId: string) {
    return this.usersService.me(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: "Update the current user's profile" })
  @ApiResponse({ status: 200, type: UserEntity })
  update(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(userId, dto);
  }

  @Patch('me/password')
  @ApiOperation({ summary: "Change the current user's password" })
  @ApiResponse({ status: 200 })
  updatePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(userId, dto);
  }
}
