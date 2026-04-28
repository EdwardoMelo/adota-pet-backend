import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TenantRepository } from '../repositories/tenant.repository';

@Injectable()
export class TenantDataService {
  constructor(private readonly tenantRepository: TenantRepository) {}

  getAll() {
    return this.tenantRepository.findAll({ orderBy: { createdAt: 'desc' } });
  }

  getById(id: number) {
    return this.tenantRepository.findById(id);
  }

  create(data: Prisma.TenantCreateInput) {
    return this.tenantRepository.create(data);
  }

  update(id: number, data: Prisma.TenantUpdateInput) {
    return this.tenantRepository.update(id, data);
  }

  remove(id: number) {
    return this.tenantRepository.remove(id);
  }
}
