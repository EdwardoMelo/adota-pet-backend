import { Module } from '@nestjs/common';
import { CitizenController } from './citizen.controller';

@Module({
  controllers: [CitizenController],
})
export class CitizenModule {}
