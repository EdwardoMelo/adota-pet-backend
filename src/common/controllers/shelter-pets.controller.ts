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
import { PetRepository } from '../repositories/pet.repository';

@Controller('api/shelter-pets')
export class ShelterPetsController {
  constructor(private readonly petRepository: PetRepository) {}

  @Get()
  getAll(@Query('tenantId') tenantId?: string) {
    const tenantIdAsNumber = tenantId ? Number(tenantId) : undefined;
    return this.petRepository.findAll({
      where: tenantIdAsNumber ? { tenantId: tenantIdAsNumber } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });
  }

  @Get('available')
  getAvailable(@Query('tenantId') tenantId?: string) {
    const tenantIdAsNumber = tenantId ? Number(tenantId) : undefined;
    return this.petRepository.findAll({
      where: {
        status: 'available',
        tenantId: tenantIdAsNumber,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.petRepository.findById(id, undefined, {
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });
  }

  @Post()
  create(
    @Body()
    body: {
      tenantId: number;
      name: string;
      age: number;
      species: 'dog' | 'cat' | 'other';
      description: string;
      imageUrl: string;
      status?: 'available' | 'adopted';
    },
  ) {
    return this.petRepository.create({
      name: body.name,
      age: body.age,
      species: body.species,
      description: body.description,
      imageUrl: body.imageUrl,
      status: body.status ?? 'available',
      tenant: { connect: { id: body.tenantId } },
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.petRepository.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.petRepository.remove(id);
  }
}
