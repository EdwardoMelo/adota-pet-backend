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
import { UserDataService } from '../services/user-data.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly userDataService: UserDataService) {}

  @Get()
  getAll(@Query('tenantId') tenantId?: string) {
    const tenantIdAsNumber = tenantId ? Number(tenantId) : undefined;
    return tenantId
      ? this.userDataService.getByTenant(tenantIdAsNumber!)
      : this.userDataService.getAll();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.userDataService.getById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      email: string;
      role: 'super_admin' | 'shelter_admin' | 'citizen';
      tenantId: number | null;
    },
  ) {
    return this.userDataService.create({
      name: body.name,
      email: body.email,
      role: body.role,
      tenant: body.tenantId ? { connect: { id: body.tenantId } } : undefined,
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.userDataService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userDataService.remove(id);
  }
}
