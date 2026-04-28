import { Injectable } from '@nestjs/common';
import { Prisma, Shelter } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ShelterRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findAll(
    params?: Prisma.ShelterFindManyArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<Shelter[]> {
    return this.getExecutor(tx).shelter.findMany(params);
  }

  findById(id: number, tx?: Prisma.TransactionClient): Promise<Shelter | null> {
    return this.getExecutor(tx).shelter.findUnique({ where: { id } });
  }

  create(
    data: Prisma.ShelterCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Shelter> {
    return this.getExecutor(tx).shelter.create({ data });
  }

  update(
    id: number,
    data: Prisma.ShelterUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Shelter> {
    return this.getExecutor(tx).shelter.update({ where: { id }, data });
  }

  remove(id: number, tx?: Prisma.TransactionClient): Promise<Shelter> {
    return this.getExecutor(tx).shelter.delete({ where: { id } });
  }
}
