import { Injectable } from '@nestjs/common';
import { Prisma, Procedure } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProcedureRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findAll(
    params?: Prisma.ProcedureFindManyArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<Procedure[]> {
    return this.getExecutor(tx).procedure.findMany(params);
  }

  findById(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Procedure | null> {
    return this.getExecutor(tx).procedure.findUnique({ where: { id } });
  }

  create(
    data: Prisma.ProcedureCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Procedure> {
    return this.getExecutor(tx).procedure.create({ data });
  }

  update(
    id: number,
    data: Prisma.ProcedureUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Procedure> {
    return this.getExecutor(tx).procedure.update({ where: { id }, data });
  }

  remove(id: number, tx?: Prisma.TransactionClient): Promise<Procedure> {
    return this.getExecutor(tx).procedure.delete({ where: { id } });
  }
}
