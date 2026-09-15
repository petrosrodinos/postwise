import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { OrganisationMembersService } from './organisation-members.service';
import { AddOrganisationMemberDto } from './dto/add-organisation-member.dto';
import { UpdateOrganisationMemberDto } from './dto/update-organisation-member.dto';
import { OrganisationMemberEntity } from './entities/organisation-member.entity';

@ApiTags('organisation-members')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('organisations/:organisationId/members')
export class OrganisationMembersController {
  constructor(private readonly membersService: OrganisationMembersService) {}

  @Get()
  @ApiOperation({ summary: 'List members of an organisation' })
  @ApiResponse({ status: 200, type: [OrganisationMemberEntity] })
  findAll(
    @CurrentUser('id') userId: string,
    @Param('organisationId') organisationId: string,
  ) {
    return this.membersService.findAll(userId, organisationId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a member to an organisation (Owner/Admin only)' })
  @ApiResponse({ status: 201, type: OrganisationMemberEntity })
  add(
    @CurrentUser('id') userId: string,
    @Param('organisationId') organisationId: string,
    @Body() dto: AddOrganisationMemberDto,
  ) {
    return this.membersService.add(userId, organisationId, dto);
  }

  @Patch(':memberId')
  @ApiOperation({ summary: "Update a member's role (Owner/Admin only)" })
  @ApiResponse({ status: 200, type: OrganisationMemberEntity })
  updateRole(
    @CurrentUser('id') userId: string,
    @Param('organisationId') organisationId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateOrganisationMemberDto,
  ) {
    return this.membersService.updateRole(userId, organisationId, memberId, dto);
  }

  @Delete(':memberId')
  @ApiOperation({ summary: 'Remove a member from an organisation (Owner/Admin only)' })
  @ApiResponse({ status: 200 })
  remove(
    @CurrentUser('id') userId: string,
    @Param('organisationId') organisationId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.membersService.remove(userId, organisationId, memberId);
  }
}
