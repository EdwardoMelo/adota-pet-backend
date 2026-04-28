import { Injectable } from '@nestjs/common';
import { AdminRegisterTicket, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminRegisterTicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findAll(
    params?: Prisma.AdminRegisterTicketFindManyArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<AdminRegisterTicket[]> {
    return this.getExecutor(tx).adminRegisterTicket.findMany(params);
  }

  findById(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<AdminRegisterTicket | null> {
    return this.getExecutor(tx).adminRegisterTicket.findUnique({
      where: { id },
    });
  }

  create(
    data: Prisma.AdminRegisterTicketCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<AdminRegisterTicket> {
    return this.getExecutor(tx).adminRegisterTicket.create({ data });
  }

  update(
    id: number,
    data: Prisma.AdminRegisterTicketUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<AdminRegisterTicket> {
    return this.getExecutor(tx).adminRegisterTicket.update({
      where: { id },
      data,
    });
  }
}
