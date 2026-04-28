import { Module } from '@nestjs/common';
import { SuperAdminController } from './super-admin.controller';
import { RegisterTicketsController } from './register-tickets.controller';
import { RegisterTicketsService } from './register-tickets.service';

@Module({
  controllers: [SuperAdminController, RegisterTicketsController],
  providers: [RegisterTicketsService],
})
export class SuperAdminModule {}
