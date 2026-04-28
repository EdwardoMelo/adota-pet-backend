import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserDataService {
  constructor(private readonly userRepository: UserRepository) {}

  getAll() {
    return this.userRepository.findAll({ orderBy: { createdAt: 'desc' } });
  }

  getById(id: number) {
    return this.userRepository.findById(id);
  }

  getByTenant(tenantId: number) {
    return this.userRepository.findAll({ where: { tenantId } });
  }

  create(data: Prisma.UserCreateInput) {
    return this.userRepository.create(data);
  }

  update(id: number, data: Prisma.UserUpdateInput) {
    return this.userRepository.update(id, data);
  }

  remove(id: number) {
    return this.userRepository.remove(id);
  }
}
