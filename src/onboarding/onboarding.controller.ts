import { Body, Controller, Post } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateCitizenDTO } from './dtos/create-citizen.dto';
import { CreateAdminRegisterTicketDTO } from './dtos/create-admin-register-ticket.dto';

@Controller('api/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('citizen')
  createCitizen(@Body() dto: CreateCitizenDTO) {
    return this.onboardingService.createCitizen(dto);
  }

  @Post('admin-register-ticket')
  createAdminRegisterTicket(@Body() dto: CreateAdminRegisterTicketDTO) {
    return this.onboardingService.createAdminRegisterTicket(dto);
  }
}
