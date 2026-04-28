import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AppointmentDataService } from '../services/appointment-data.service';

@Controller('api/appointments')
export class AppointmentsController {
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
      tenantId: number;
      userId: number;
      procedureId: number;
      userPetId?: number | null;
      scheduledAt: string;
      notes?: string;
    },
  ) {
    return this.appointmentDataService.create({
      tenant: { connect: { id: body.tenantId } },
      user: { connect: { id: body.userId } },
      procedure: { connect: { id: body.procedureId } },
      userPet:
        body.userPetId && body.userPetId !== null
          ? { connect: { id: body.userPetId } }
          : undefined,
      scheduledAt: new Date(body.scheduledAt),
      status: 'scheduled',
      notes: body.notes,
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
