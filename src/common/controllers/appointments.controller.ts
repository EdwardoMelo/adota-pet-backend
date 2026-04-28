import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AppointmentDataService } from '../services/appointment-data.service';

@Controller('api/appointments')
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(
    private readonly appointmentDataService: AppointmentDataService,
  ) {}

  @Get()
  getAll(
    @Query('tenantId') tenantId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.appointmentDataService.getAll({
      tenantId: tenantId ? Number(tenantId) : undefined,
      userId: userId ? Number(userId) : undefined,
    });
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentDataService.getById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      tenantId: number | string;
      userId: number | string;
      procedureId: number | string;
      userPetId: number | string;
      scheduledAt: string;
      notes?: string;
    },
  ) {
    this.logger.debug(
      `POST /appointments payload received: ${JSON.stringify(body)}`,
    );

    const parsed = {
      tenantId: Number(body.tenantId),
      userId: Number(body.userId),
      procedureId: Number(body.procedureId),
      userPetId: Number(body.userPetId),
      scheduledAt: body.scheduledAt,
      notes: body.notes,
    };

    this.logger.debug(
      `POST /appointments parsed payload: ${JSON.stringify(parsed)}`,
    );

    if (
      Number.isNaN(parsed.tenantId) ||
      Number.isNaN(parsed.userId) ||
      Number.isNaN(parsed.procedureId) ||
      Number.isNaN(parsed.userPetId)
    ) {
      this.logger.warn(
        `POST /appointments invalid numeric IDs: ${JSON.stringify(parsed)}`,
      );
      throw new BadRequestException('IDs inválidos no agendamento.');
    }

    return this.appointmentDataService.createForCitizen({
      tenantId: parsed.tenantId,
      userId: parsed.userId,
      procedureId: parsed.procedureId,
      userPetId: parsed.userPetId,
      scheduledAt: parsed.scheduledAt,
      notes: parsed.notes,
    });
  }

  @Post('visit')
  createVisit(
    @Body()
    body: {
      tenantId: number | string;
      userId: number | string;
      procedureId: number | string;
      petId: number | string;
      scheduledAt: string;
      notes?: string;
    },
  ) {
    this.logger.debug(
      `POST /appointments/visit payload received: ${JSON.stringify(body)}`,
    );

    const parsed = {
      tenantId: Number(body.tenantId),
      userId: Number(body.userId),
      procedureId: Number(body.procedureId),
      petId: Number(body.petId),
      scheduledAt: body.scheduledAt,
      notes: body.notes,
    };

    this.logger.debug(
      `POST /appointments/visit parsed payload: ${JSON.stringify(parsed)}`,
    );

    if (
      Number.isNaN(parsed.tenantId) ||
      Number.isNaN(parsed.userId) ||
      Number.isNaN(parsed.procedureId) ||
      Number.isNaN(parsed.petId)
    ) {
      this.logger.warn(
        `POST /appointments/visit invalid numeric IDs: ${JSON.stringify(parsed)}`,
      );
      throw new BadRequestException('IDs inválidos no agendamento de visita.');
    }

    return this.appointmentDataService.createVisitForCitizen({
      tenantId: parsed.tenantId,
      userId: parsed.userId,
      procedureId: parsed.procedureId,
      petId: parsed.petId,
      scheduledAt: parsed.scheduledAt,
      notes: parsed.notes,
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    const payload = { ...body } as { scheduledAt?: string };
    return this.appointmentDataService.update(id, {
      ...payload,
      scheduledAt: payload.scheduledAt
        ? new Date(payload.scheduledAt)
        : undefined,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentDataService.remove(id);
  }
}
