import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganisationMembersService } from './organisation-members.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@ApiTags('organisation-invitations')
@Controller('organisation-invitations')
export class OrganisationInvitationsController {
  constructor(private readonly membersService: OrganisationMembersService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch invitation details by token' })
  @ApiResponse({ status: 200, description: 'Invitation details' })
  @ApiResponse({ status: 400, description: 'Invalid or expired invitation' })
  getInvitation(@Query('token') token: string) {
    return this.membersService.getInvitationByToken(token);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept an invitation, set a password, and log in' })
  @ApiResponse({ status: 201, description: 'Invitation accepted, session issued' })
  @ApiResponse({ status: 400, description: 'Invalid or expired invitation' })
  accept(@Body() dto: AcceptInvitationDto) {
    return this.membersService.acceptInvitation(dto);
  }
}
