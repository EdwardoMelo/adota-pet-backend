import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findAll(
    params?: Prisma.UserFindManyArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<User[]> {
    return this.getExecutor(tx).user.findMany(params);
  }

  findById(id: number, tx?: Prisma.TransactionClient): Promise<User | null> {
    return this.getExecutor(tx).user.findUnique({ where: { id } });
  }

  findByEmail(
    email: string,
    tx?: Prisma.TransactionClient,
  ): Promise<User | null> {
    return this.getExecutor(tx).user.findUnique({ where: { email } });
  }

  create(
    data: Prisma.UserCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    return this.getExecutor(tx).user.create({ data });
  }

  update(
    id: number,
    data: Prisma.UserUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    return this.getExecutor(tx).user.update({ where: { id }, data });
  }

  remove(id: number, tx?: Prisma.TransactionClient): Promise<User> {
    return this.getExecutor(tx).user.delete({ where: { id } });
  }
}
