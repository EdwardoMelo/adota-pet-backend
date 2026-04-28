import { Injectable } from '@nestjs/common';
import { Prisma, Tenant } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findAll(
    params?: Prisma.TenantFindManyArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<Tenant[]> {
    return this.getExecutor(tx).tenant.findMany(params);
  }

  findById(id: number, tx?: Prisma.TransactionClient): Promise<Tenant | null> {
    return this.getExecutor(tx).tenant.findUnique({ where: { id } });
  }

  create(
    data: Prisma.TenantCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Tenant> {
    return this.getExecutor(tx).tenant.create({ data });
  }

  update(
    id: number,
    data: Prisma.TenantUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Tenant> {
    return this.getExecutor(tx).tenant.update({ where: { id }, data });
  }

  remove(id: number, tx?: Prisma.TransactionClient): Promise<Tenant> {
    return this.getExecutor(tx).tenant.delete({ where: { id } });
  }
}
