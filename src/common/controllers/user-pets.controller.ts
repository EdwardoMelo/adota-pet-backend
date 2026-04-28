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
import { UserPetDataService } from '../services/user-pet-data.service';

@Controller('api/user-pets')
export class UserPetsController {
  constructor(private readonly userPetDataService: UserPetDataService) {}

  @Get()
  getByUser(@Query('userId') userId: string) {
    return this.userPetDataService.getByUser(Number(userId));
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.userPetDataService.getById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      userId: number;
      name: string;
      age: number;
      type: 'dog' | 'cat' | 'other';
      notes?: string;
    },
  ) {
    return this.userPetDataService.create({
      name: body.name,
      age: body.age,
      type: body.type,
      notes: body.notes,
      user: { connect: { id: body.userId } },
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.userPetDataService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userPetDataService.remove(id);
  }
}
