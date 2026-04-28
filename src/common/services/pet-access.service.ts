import { Injectable, Logger } from '@nestjs/common';
import { Prisma, ShelterPet } from '@prisma/client';
import { PetRepository } from '../repositories/pet.repository';

@Injectable()
export class PetAccessService {
  private readonly logger = new Logger(PetAccessService.name);

  constructor(private readonly petRepository: PetRepository) {}

  getPetById(id: number): Promise<ShelterPet | null> {
    this.logger.debug(`Consultando pet ${id}`);
    return this.petRepository.findById(id);
  }

  updatePet(
    id: number,
    payload: Prisma.ShelterPetUpdateInput,
  ): Promise<ShelterPet> {
    this.logger.log(`Atualizando pet ${id}`);
    return this.petRepository.update(id, payload);
  }

  deletePet(id: number): Promise<ShelterPet> {
    this.logger.warn(`Removendo pet ${id}`);
    return this.petRepository.remove(id);
  }
}
