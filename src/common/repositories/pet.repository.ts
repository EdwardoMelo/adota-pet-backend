import { Injectable } from '@nestjs/common';
import { Prisma, ShelterPet } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PetRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findAll(
    params?: Prisma.ShelterPetFindManyArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<ShelterPet[]> {
    return this.getExecutor(tx).shelterPet.findMany(params);
  }

  findById(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<ShelterPet | null> {
    return this.getExecutor(tx).shelterPet.findUnique({ where: { id } });
  }

  create(
    data: Prisma.ShelterPetCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<ShelterPet> {
    return this.getExecutor(tx).shelterPet.create({ data });
  }

  update(
    id: number,
    data: Prisma.ShelterPetUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<ShelterPet> {
    return this.getExecutor(tx).shelterPet.update({ where: { id }, data });
  }

  remove(id: number, tx?: Prisma.TransactionClient): Promise<ShelterPet> {
    return this.getExecutor(tx).shelterPet.delete({ where: { id } });
  }
}
