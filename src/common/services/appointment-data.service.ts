import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppointmentRepository } from '../repositories/appointment.repository';

@Injectable()
export class AppointmentDataService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  getAll(filter?: { tenantId?: number; userId?: number }) {
    return this.appointmentRepository.findAll({
      where: {
        tenantId: filter?.tenantId,
        userId: filter?.userId,
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  getById(id: number) {
    return this.appointmentRepository.findById(id);
  }

  create(data: Prisma.AppointmentCreateInput) {
    return this.appointmentRepository.create(data);
  }

  update(id: number, data: Prisma.AppointmentUpdateInput) {
    return this.appointmentRepository.update(id, data);
  }

  remove(id: number) {
    return this.appointmentRepository.remove(id);
  }
}
