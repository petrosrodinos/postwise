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

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      },
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

    return { message: 'Password updated successfully' };
  }
}
