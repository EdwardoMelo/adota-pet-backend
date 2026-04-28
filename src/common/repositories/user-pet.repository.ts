import { Injectable } from '@nestjs/common';
import { Prisma, UserPet } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserPetRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findAll(
    params?: Prisma.UserPetFindManyArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<UserPet[]> {
    return this.getExecutor(tx).userPet.findMany(params);
  }

  findById(id: number, tx?: Prisma.TransactionClient): Promise<UserPet | null> {
    return this.getExecutor(tx).userPet.findUnique({ where: { id } });
  }

  create(
    data: Prisma.UserPetCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<UserPet> {
    return this.getExecutor(tx).userPet.create({ data });
  }

  update(
    id: number,
    data: Prisma.UserPetUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<UserPet> {
    return this.getExecutor(tx).userPet.update({ where: { id }, data });
  }

  remove(id: number, tx?: Prisma.TransactionClient): Promise<UserPet> {
    return this.getExecutor(tx).userPet.delete({ where: { id } });
  }
}
