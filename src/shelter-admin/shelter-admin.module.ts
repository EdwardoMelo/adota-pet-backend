import { Module } from '@nestjs/common';
import { ShelterAdminController } from './shelter-admin.controller';

@Module({
  controllers: [ShelterAdminController],
})
export class ShelterAdminModule {}
