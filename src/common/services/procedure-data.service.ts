import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProcedureRepository } from '../repositories/procedure.repository';

@Injectable()
export class ProcedureDataService {
  constructor(private readonly procedureRepository: ProcedureRepository) {}

  getAll(tenantId?: number) {
    return this.procedureRepository.findAll({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  getActiveByTenant(tenantId: number) {
    return this.procedureRepository.findAll({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  getById(id: number) {
    return this.procedureRepository.findById(id);
  }

  create(data: Prisma.ProcedureCreateInput) {
    return this.procedureRepository.create(data);
  }

  update(id: number, data: Prisma.ProcedureUpdateInput) {
    return this.procedureRepository.update(id, data);
  }

  remove(id: number) {
    return this.procedureRepository.remove(id);
  }
}
