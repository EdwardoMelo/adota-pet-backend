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

  private normalize(value?: string | null) {
    return (value ?? '').trim().toLowerCase();
  }

  private matchesLocation(
    pet: {
      name?: string;
      description?: string;
      tenant?: { address?: unknown };
    },
    city?: string,
    state?: string,
    search?: string,
  ) {
    const cityFilter = this.normalize(city);
    const stateFilter = this.normalize(state);
    const searchFilter = this.normalize(search);
    const address = (pet.tenant?.address ?? {}) as { city?: string; state?: string };
    const cityValue = this.normalize(address.city);
    const stateValue = this.normalize(address.state);
    const combined = this.normalize(`${pet.name ?? ''} ${pet.description ?? ''}`);

    if (cityFilter && !cityValue.includes(cityFilter)) return false;
    if (stateFilter && !stateValue.includes(stateFilter)) return false;
    if (searchFilter && !combined.includes(searchFilter)) return false;
    return true;
  }

  @Get()
  async getAll(
    @Query('tenantId') tenantId?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('search') search?: string,
  ) {
    const tenantIdAsNumber = tenantId ? Number(tenantId) : undefined;
    const pets = await this.petRepository.findAll({
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
    return pets.filter((pet) => this.matchesLocation(pet, city, state, search));
  }

  @Get('available')
  async getAvailable(
    @Query('tenantId') tenantId?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('search') search?: string,
  ) {
    const tenantIdAsNumber = tenantId ? Number(tenantId) : undefined;
    const pets = await this.petRepository.findAll({
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
    return pets.filter((pet) => this.matchesLocation(pet, city, state, search));
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
