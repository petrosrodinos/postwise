import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ErrorCodes } from '@/shared/config/error-codes';
import { ActivityLogsService } from '@/modules/activity-logs/activity-logs.service';
import { diffFields } from '@/modules/activity-logs/utils/activity-log.utils';
import { ActivityLogAction, ActivityLogEntityType } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  private sanitize<T extends { password?: string }>(user: T): Omit<T, 'password'> {
    const { password, ...rest } = user;
    return rest;
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async update(userId: string, dto: UpdateUserDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException({
          message: 'Email is already in use',
          code: ErrorCodes.Users.EMAIL_ALREADY_IN_USE,
        });
      }
    }

    const before = await this.prisma.user.findUnique({ where: { id: userId } });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      },
    });

    this.activityLogsService.log({
      organisation_id: null,
      user_id: userId,
      action: ActivityLogAction.USER_PROFILE_UPDATED,
      entity_type: ActivityLogEntityType.USER,
      entity_id: userId,
      description: `${user.name} updated their profile`,
      metadata: { changes: diffFields(before, user, ['name', 'email', 'phone']) },
    });

    return this.sanitize(user);
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const matches = await bcrypt.compare(dto.current_password, user.password);
    if (!matches) {
      throw new BadRequestException({
        message: 'Current password is incorrect',
        code: ErrorCodes.Users.INVALID_CURRENT_PASSWORD,
      });
    }

    const hashed = await bcrypt.hash(dto.new_password, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    this.activityLogsService.log({
      organisation_id: null,
      user_id: userId,
      action: ActivityLogAction.PASSWORD_CHANGED,
      entity_type: ActivityLogEntityType.USER,
      entity_id: userId,
      description: `${user.name} changed their password`,
    });

    return { message: 'Password updated successfully' };
  }
}
