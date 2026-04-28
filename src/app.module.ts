import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { ShelterAdminModule } from './shelter-admin/shelter-admin.module';
import { CitizenModule } from './citizen/citizen.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    CommonModule,
    SuperAdminModule,
    ShelterAdminModule,
    CitizenModule,
    OnboardingModule,
    AuthModule,
  ],
})
export class AppModule {}
