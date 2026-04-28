import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { UserPetRepository } from '../repositories/user-pet.repository';
import { ProcedureRepository } from '../repositories/procedure.repository';
import { PetRepository } from '../repositories/pet.repository';

@Injectable()
export class AppointmentDataService {
  private readonly logger = new Logger(AppointmentDataService.name);

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly userPetRepository: UserPetRepository,
    private readonly procedureRepository: ProcedureRepository,
    private readonly petRepository: PetRepository,
  ) {}

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

  async createForCitizen(params: {
    tenantId: number;
    userId: number;
    procedureId: number;
    userPetId: number;
    scheduledAt: string;
    notes?: string;
  }) {
    this.logger.debug(
      `createForCitizen called with params: ${JSON.stringify(params)}`,
    );

    try {
      const userPet = await this.userPetRepository.findById(params.userPetId);
      this.logger.debug(
        `Fetched userPet for appointment: ${
          userPet ? JSON.stringify({ id: userPet.id, userId: userPet.userId }) : 'null'
        }`,
      );

      if (!userPet || userPet.userId !== params.userId) {
        this.logger.warn(
          `Appointment denied: pet ${params.userPetId} does not belong to user ${params.userId}`,
        );
        throw new BadRequestException(
          'O pet selecionado não pertence ao usuário que está agendando.',
        );
      }

      const created = await this.appointmentRepository.create({
        tenant: { connect: { id: params.tenantId } },
        user: { connect: { id: params.userId } },
        procedure: { connect: { id: params.procedureId } },
        userPet: { connect: { id: params.userPetId } },
        scheduledAt: new Date(params.scheduledAt),
        status: 'scheduled',
        notes: params.notes,
      });

      this.logger.log(
        `Appointment created successfully: id=${created.id}, userId=${params.userId}, userPetId=${params.userPetId}, tenantId=${params.tenantId}`,
      );

      return created;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create appointment for user ${params.userId} with pet ${params.userPetId}: ${message}`,
      );
      throw error;
    }
  }

  async createVisitForCitizen(params: {
    tenantId: number;
    userId: number;
    procedureId: number;
    petId: number;
    scheduledAt: string;
    notes?: string;
  }) {
    this.logger.debug(
      `createVisitForCitizen called with params: ${JSON.stringify(params)}`,
    );

    try {
      const [procedure, shelterPet] = await Promise.all([
        this.procedureRepository.findById(params.procedureId),
        this.petRepository.findById(params.petId),
      ]);

      this.logger.debug(
        `Visit context fetched: procedure=${procedure ? JSON.stringify({ id: procedure.id, tenantId: procedure.tenantId, name: procedure.name }) : 'null'}, shelterPet=${shelterPet ? JSON.stringify({ id: shelterPet.id, tenantId: shelterPet.tenantId }) : 'null'}`,
      );

      if (!procedure || procedure.tenantId !== params.tenantId) {
        throw new BadRequestException(
          'Procedimento de visita inválido para o canil informado.',
        );
      }

      if (!shelterPet || shelterPet.tenantId !== params.tenantId) {
        throw new BadRequestException(
          'Pet de visita inválido para o canil informado.',
        );
      }

      const created = await this.appointmentRepository.create({
        tenant: { connect: { id: params.tenantId } },
        user: { connect: { id: params.userId } },
        procedure: { connect: { id: params.procedureId } },
        userPet: undefined,
        scheduledAt: new Date(params.scheduledAt),
        status: 'scheduled',
        notes: params.notes,
      });

      this.logger.log(
        `Visit appointment created: id=${created.id}, userId=${params.userId}, tenantId=${params.tenantId}, shelterPetId=${params.petId}`,
      );
      return created;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create visit appointment for user ${params.userId}: ${message}`,
      );
      throw error;
    }
  }

  update(id: number, data: Prisma.AppointmentUpdateInput) {
    return this.appointmentRepository.update(id, data);
  }

  remove(id: number) {
    return this.appointmentRepository.remove(id);
  }
}
