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
import { TenantDataService } from '../services/tenant-data.service';

@Controller('api/tenants')
export class TenantsController {
  constructor(private readonly tenantDataService: TenantDataService) {}

  private normalize(value?: string | null) {
    return (value ?? '').trim().toLowerCase();
  }

  @Get()
  async getAll(
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
  ) {
    const tenants = await this.tenantDataService.getAll();
    const searchFilter = this.normalize(search);
    const cityFilter = this.normalize(city);
    const stateFilter = this.normalize(state);

    return tenants.filter((tenant) => {
      const tenantCity = this.normalize((tenant.address as { city?: string })?.city);
      const tenantState = this.normalize((tenant.address as { state?: string })?.state);
      const tenantName = this.normalize(tenant.name);
      const tenantStreet = this.normalize((tenant.address as { street?: string })?.street);

      if (cityFilter && !tenantCity.includes(cityFilter)) return false;
      if (stateFilter && !tenantState.includes(stateFilter)) return false;
      if (
        searchFilter &&
        !`${tenantName} ${tenantStreet} ${tenantCity} ${tenantState}`.includes(searchFilter)
      ) {
        return false;
      }
      return true;
    });
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
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        number: string;
        apartment?: string | null;
      };
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
