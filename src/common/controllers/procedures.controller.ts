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
import { ProcedureDataService } from '../services/procedure-data.service';

@Controller('api/procedures')
export class ProceduresController {
  constructor(private readonly procedureDataService: ProcedureDataService) {}

  @Get()
  getAll(@Query('tenantId') tenantId?: string) {
    return this.procedureDataService.getAll(
      tenantId ? Number(tenantId) : undefined,
    );
  }

  @Get('active')
  getActiveByTenant(@Query('tenantId') tenantId: string) {
    return this.procedureDataService.getActiveByTenant(Number(tenantId));
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.procedureDataService.getById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      tenantId: number | string;
      name: string;
      description: string;
      durationMinutes: number;
      isActive?: boolean;
    },
  ) {
    return this.procedureDataService.create({
      name: body.name,
      description: body.description,
      durationMinutes: body.durationMinutes,
      isActive: body.isActive ?? true,
      tenant: { connect: { id: Number(body.tenantId) } },
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.procedureDataService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.procedureDataService.remove(id);
  }
}
