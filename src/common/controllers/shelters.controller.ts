import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ShelterDataService } from '../services/shelter-data.service';

@Controller('api/shelters')
export class SheltersController {
  constructor(private readonly shelterDataService: ShelterDataService) {}

  private normalize(value?: string | null) {
    return (value ?? '').trim().toLowerCase();
  }

  @Get()
  async getAll(
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const tenantIdAsNumber = tenantId ? Number(tenantId) : undefined;
    const shelters = await this.shelterDataService.getAll({
      where: tenantIdAsNumber ? { tenantId: tenantIdAsNumber } : undefined,
    });

    const searchFilter = this.normalize(search);
    const cityFilter = this.normalize(city);
    const stateFilter = this.normalize(state);

    return shelters.filter((shelter) => {
      const address = (shelter.address ?? {}) as {
        street?: string;
        city?: string;
        state?: string;
      };
      const shelterCity = this.normalize(address.city);
      const shelterState = this.normalize(address.state);
      const shelterName = this.normalize(shelter.name);
      const shelterStreet = this.normalize(address.street);

      if (cityFilter && !shelterCity.includes(cityFilter)) return false;
      if (stateFilter && !shelterState.includes(stateFilter)) return false;
      if (
        searchFilter &&
        !`${shelterName} ${shelterStreet} ${shelterCity} ${shelterState}`.includes(
          searchFilter,
        )
      ) {
        return false;
      }
      return true;
    });
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.shelterDataService.getById(id);
  }
}

