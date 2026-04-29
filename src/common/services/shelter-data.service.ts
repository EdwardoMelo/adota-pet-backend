import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ShelterRepository } from '../repositories/shelter.repository';

@Injectable()
export class ShelterDataService {
  constructor(private readonly shelterRepository: ShelterRepository) {}

  getAll(args?: Prisma.ShelterFindManyArgs) {
    return this.shelterRepository.findAll({
      orderBy: { createdAt: 'desc' },
      ...args,
    });
  }

  getById(id: number) {
    return this.shelterRepository.findById(id);
  }
}

