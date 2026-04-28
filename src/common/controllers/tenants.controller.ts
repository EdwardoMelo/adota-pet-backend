import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { TenantDataService } from '../services/tenant-data.service';

@Controller('api/tenants')
export class TenantsController {
  constructor(private readonly tenantDataService: TenantDataService) {}

  @Get()
  getAll() {
    return this.tenantDataService.getAll();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.tenantDataService.getById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      city: string;
      subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled';
      stripeAccountId?: string;
    },
  ) {
    return this.tenantDataService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.tenantDataService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tenantDataService.remove(id);
  }
}
