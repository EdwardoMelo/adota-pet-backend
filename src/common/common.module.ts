import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TenantsController } from './controllers/tenants.controller';
import { UsersController } from './controllers/users.controller';
import { ShelterPetsController } from './controllers/shelter-pets.controller';
import { SheltersController } from './controllers/shelters.controller';
import { ProceduresController } from './controllers/procedures.controller';
import { UserPetsController } from './controllers/user-pets.controller';
import { AppointmentsController } from './controllers/appointments.controller';
import { AdoptionsController } from './controllers/adoptions.controller';
import { PetRepository } from './repositories/pet.repository';
import { TenantRepository } from './repositories/tenant.repository';
import { UserRepository } from './repositories/user.repository';
import { ProcedureRepository } from './repositories/procedure.repository';
import { UserPetRepository } from './repositories/user-pet.repository';
import { AppointmentRepository } from './repositories/appointment.repository';
import { AdoptionRepository } from './repositories/adoption.repository';
import { ShelterRepository } from './repositories/shelter.repository';
import { AdminRegisterTicketRepository } from './repositories/admin-register-ticket.repository';
import { PetAccessService } from './services/pet-access.service';
import { TenantDataService } from './services/tenant-data.service';
import { UserDataService } from './services/user-data.service';
import { ProcedureDataService } from './services/procedure-data.service';
import { UserPetDataService } from './services/user-pet-data.service';
import { AppointmentDataService } from './services/appointment-data.service';
import { AdoptionDataService } from './services/adoption-data.service';
import { ShelterDataService } from './services/shelter-data.service';
import { EmailService } from './services/email.service';
import { RolesGuard } from './guards/roles.guard';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  controllers: [
    TenantsController,
    UsersController,
    ShelterPetsController,
    SheltersController,
    ProceduresController,
    UserPetsController,
    AppointmentsController,
    AdoptionsController,
  ],
  providers: [
    PrismaService,
    PetRepository,
    TenantRepository,
    UserRepository,
    ProcedureRepository,
    UserPetRepository,
    AppointmentRepository,
    AdoptionRepository,
    ShelterRepository,
    AdminRegisterTicketRepository,
    PetAccessService,
    TenantDataService,
    UserDataService,
    ProcedureDataService,
    UserPetDataService,
    AppointmentDataService,
    AdoptionDataService,
    ShelterDataService,
    EmailService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [
    PrismaService,
    PetRepository,
    TenantRepository,
    UserRepository,
    ProcedureRepository,
    UserPetRepository,
    AppointmentRepository,
    AdoptionRepository,
    ShelterRepository,
    AdminRegisterTicketRepository,
    PetAccessService,
    TenantDataService,
    UserDataService,
    ProcedureDataService,
    UserPetDataService,
    AppointmentDataService,
    AdoptionDataService,
    ShelterDataService,
    EmailService,
  ],
})
export class CommonModule {}
