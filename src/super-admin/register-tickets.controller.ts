import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ApproveAdminRegisterTicketDTO } from './dtos/approve-admin-register-ticket.dto';
import { RegisterTicketsService } from './register-tickets.service';

@Controller('api/admin/register-tickets')
@Roles(UserRole.SuperAdmin)
export class RegisterTicketsController {
  constructor(
    private readonly registerTicketsService: RegisterTicketsService,
  ) {}

  @Get()
  list() {
    return this.registerTicketsService.getAll();
  }

  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveAdminRegisterTicketDTO,
  ) {
    void dto;
    return this.registerTicketsService.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.registerTicketsService.reject(id);
  }
}
