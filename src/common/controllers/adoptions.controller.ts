import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AdoptionDataService } from '../services/adoption-data.service';

@Controller('api/adoptions')
export class AdoptionsController {
  constructor(private readonly adoptionDataService: AdoptionDataService) {}

  @Get()
  getAll(
    @Query('tenantId') tenantId?: string,
    @Query('userId') userId?: string,
    @Query('petId') petId?: string,
    @Query('status') status?: 'pending' | 'completed' | 'cancelled',
  ) {
    return this.adoptionDataService.getAll({
      tenantId: tenantId ? Number(tenantId) : undefined,
      userId: userId ? Number(userId) : undefined,
      petId: petId ? Number(petId) : undefined,
      status,
    });
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.adoptionDataService.getById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      tenantId: number;
      petId: number;
      userId: number;
      notes?: string;
    },
  ) {
    return this.adoptionDataService.create({
      tenant: { connect: { id: body.tenantId } },
      pet: { connect: { id: body.petId } },
      user: { connect: { id: body.userId } },
      userPet: undefined,
      notes: body.notes,
      status: 'pending',
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: { status?: 'pending' | 'completed' | 'cancelled'; notes?: string },
  ) {
    return this.adoptionDataService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adoptionDataService.remove(id);
  }
}
