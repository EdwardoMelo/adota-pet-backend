import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { PetAccessService } from '../common/services/pet-access.service';

@Controller('shelter-admin')
@Roles(UserRole.ShelterAdmin)
export class ShelterAdminController {
  constructor(private readonly petAccessService: PetAccessService) {}

  @Get('appointments')
  getAppointments() {
    return [{ id: 'appt-1', status: 'scheduled' }];
  }

  @Get('adoptions')
  getAdoptions() {
    return [{ id: 'adopt-1', status: 'pending' }];
  }

  @Patch('adoptions/:id/status')
  updateAdoptionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: { status: 'pending' | 'completed' | 'cancelled' },
  ) {
    return {
      id,
      status: payload.status,
      message: 'Status de adoção atualizado.',
    };
  }

  @Get('pets/:id')
  getPetById(@Param('id', ParseIntPipe) id: number) {
    return this.petAccessService.getPetById(id);
  }

  @Patch('pets/:id')
  updatePet(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.petAccessService.updatePet(id, payload);
  }

  @Delete('pets/:id')
  async deletePet(@Param('id', ParseIntPipe) id: number) {
    await this.petAccessService.deletePet(id);
    return { message: 'Pet removido com sucesso.' };
  }
}
