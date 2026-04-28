import { Injectable } from '@nestjs/common';
import { Prisma, ShelterPetStatus } from '@prisma/client';
import { AdoptionRepository } from '../repositories/adoption.repository';
import { PetRepository } from '../repositories/pet.repository';
import { PrismaService } from '../prisma.service';
import { UserPetRepository } from '../repositories/user-pet.repository';

@Injectable()
export class AdoptionDataService {
  constructor(
    private readonly adoptionRepository: AdoptionRepository,
    private readonly petRepository: PetRepository,
    private readonly userPetRepository: UserPetRepository,
    private readonly prisma: PrismaService,
  ) {}

  getAll(filter?: {
    tenantId?: number;
    userId?: number;
    petId?: number;
    status?: 'pending' | 'completed' | 'cancelled';
  }) {
    return this.adoptionRepository.findAll({
      where: {
        tenantId: filter?.tenantId,
        userId: filter?.userId,
        petId: filter?.petId,
        status: filter?.status,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  getById(id: number) {
    return this.adoptionRepository.findById(id);
  }

  create(data: Prisma.AdoptionCreateInput) {
    return this.adoptionRepository.create(data);
  }

  update(id: number, data: Prisma.AdoptionUpdateInput) {
    return this.prisma.$transaction(async (tx) => {
      const previous = await this.adoptionRepository.findById(id, tx);
      const updated = await this.adoptionRepository.update(id, data, tx);

      if (!previous) return updated;

      if (data.status === 'completed') {
        await this.petRepository.update(
          updated.petId,
          { status: ShelterPetStatus.adopted },
          tx,
        );

        if (previous.status !== 'completed') {
          const pet = await this.petRepository.findById(updated.petId, tx);
          if (pet) {
            await this.userPetRepository.create(
              {
                user: { connect: { id: updated.userId } },
                sourceAdoption: { connect: { id: updated.id } },
                name: pet.name,
                age: pet.age,
                type: pet.species,
                notes: pet.description,
              },
              tx,
            );
          }
        }
      }

      if (data.status === 'cancelled') {
        const openAdoptions = await this.adoptionRepository.findAll(
          {
            where: {
              petId: updated.petId,
              id: { not: updated.id },
              status: { in: ['pending', 'completed'] },
            },
          },
          tx,
        );

        if (openAdoptions.length === 0) {
          await this.petRepository.update(
            updated.petId,
            { status: ShelterPetStatus.available },
            tx,
          );
        }
      }

      return updated;
    });
  }

  remove(id: number) {
    return this.adoptionRepository.remove(id);
  }
}
