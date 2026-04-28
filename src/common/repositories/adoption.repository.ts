import { Adoption, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdoptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findAll(
    params?: Prisma.AdoptionFindManyArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<Adoption[]> {
    return this.getExecutor(tx).adoption.findMany(params);
  }

  findById(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Adoption | null> {
    return this.getExecutor(tx).adoption.findUnique({ where: { id } });
  }

  create(
    data: Prisma.AdoptionCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Adoption> {
    return this.getExecutor(tx).adoption.create({ data });
  }

  update(
    id: number,
    data: Prisma.AdoptionUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Adoption> {
    return this.getExecutor(tx).adoption.update({ where: { id }, data });
  }

  remove(id: number, tx?: Prisma.TransactionClient): Promise<Adoption> {
    return this.getExecutor(tx).adoption.delete({ where: { id } });
  }
}
