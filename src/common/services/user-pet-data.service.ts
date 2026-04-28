import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserPetRepository } from '../repositories/user-pet.repository';

@Injectable()
export class UserPetDataService {
  constructor(private readonly userPetRepository: UserPetRepository) {}

  getByUser(userId: number) {
    return this.userPetRepository.findAll({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  getById(id: number) {
    return this.userPetRepository.findById(id);
  }

  create(data: Prisma.UserPetCreateInput) {
    return this.userPetRepository.create(data);
  }

  update(id: number, data: Prisma.UserPetUpdateInput) {
    return this.userPetRepository.update(id, data);
  }

  remove(id: number) {
    return this.userPetRepository.remove(id);
  }
}
