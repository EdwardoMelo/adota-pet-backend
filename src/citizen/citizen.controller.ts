import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { PetAccessService } from '../common/services/pet-access.service';

@Controller('citizen')
@Roles(UserRole.Citizen)
export class CitizenController {
  constructor(private readonly petAccessService: PetAccessService) {}

  @Get('pets/:id')
  getPetById(@Param('id', ParseIntPipe) id: number) {
    return this.petAccessService.getPetById(id);
  }

  @Post('appointments')
  createAppointment(
    @Body()
    payload: {
      tenantId: number;
      procedureId: number;
      scheduledAt: string;
      notes?: string;
    },
  ) {
    return {
      id: 'appt-mock',
      ...payload,
      status: 'scheduled',
    };
  }

  @Post('adoptions')
  createAdoption(
    @Body() payload: { petId: number; tenantId: number; notes?: string },
  ) {
    return {
      id: 'adopt-mock',
      ...payload,
      status: 'pending',
    };
  }

  @Get('adoptions/me')
  getMyAdoptions() {
    return [{ id: 'adopt-mock', status: 'pending' }];
  }
}
