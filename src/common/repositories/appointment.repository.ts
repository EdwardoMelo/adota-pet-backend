import { Injectable } from '@nestjs/common';
import { Appointment, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getExecutor(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  findAll(
    params?: Prisma.AppointmentFindManyArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<Appointment[]> {
    return this.getExecutor(tx).appointment.findMany(params);
  }

  findById(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Appointment | null> {
    return this.getExecutor(tx).appointment.findUnique({ where: { id } });
  }

  create(
    data: Prisma.AppointmentCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Appointment> {
    return this.getExecutor(tx).appointment.create({ data });
  }

  update(
    id: number,
    data: Prisma.AppointmentUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Appointment> {
    return this.getExecutor(tx).appointment.update({ where: { id }, data });
  }

  remove(id: number, tx?: Prisma.TransactionClient): Promise<Appointment> {
    return this.getExecutor(tx).appointment.delete({ where: { id } });
  }
}
