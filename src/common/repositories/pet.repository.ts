import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PetRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findAll<T extends Prisma.ShelterPetFindManyArgs>(
    params?: Prisma.SelectSubset<T, Prisma.ShelterPetFindManyArgs>,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.ShelterPetGetPayload<T>[]> {
    return this.getExecutor(tx).shelterPet.findMany(params);
  }

  findById(
    id: number,
    tx?: Prisma.TransactionClient,
    args?: Omit<Prisma.ShelterPetFindUniqueArgs, 'where'>,
  ): Promise<any> {
    return this.getExecutor(tx).shelterPet.findUnique({
      where: { id },
      ...(args ?? {}),
    });
  }

  create(data: Prisma.ShelterPetCreateInput, tx?: Prisma.TransactionClient) {
    return this.getExecutor(tx).shelterPet.create({ data });
  }

  update(
    id: number,
    data: Prisma.ShelterPetUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return this.getExecutor(tx).shelterPet.update({ where: { id }, data });
  }

  remove(id: number, tx?: Prisma.TransactionClient) {
    return this.getExecutor(tx).shelterPet.delete({ where: { id } });
  }
}
