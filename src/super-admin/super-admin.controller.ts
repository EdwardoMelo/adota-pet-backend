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
import { PetAccessService } from '../common/services/pet-access.service';

@Controller('super-admin')
@Roles(UserRole.SuperAdmin)
export class SuperAdminController {
  constructor(private readonly petAccessService: PetAccessService) {}

  @Get('dashboard')
  getDashboard() {
    return {
      tenants: 3,
      shelterAdmins: 2,
      citizens: 2,
      activeAdoptions: 1,
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
}
