import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { AdminRegisterTicketRepository } from '../common/repositories/admin-register-ticket.repository';
import { UserRepository } from '../common/repositories/user.repository';
import { CreateAdminRegisterTicketDTO } from './dtos/create-admin-register-ticket.dto';
import { CreateCitizenDTO } from './dtos/create-citizen.dto';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly adminRegisterTicketRepository: AdminRegisterTicketRepository,
  ) {}

  async createCitizen(dto: CreateCitizenDTO) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const createdUser = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: passwordHash,
      role: UserRole.citizen,
    });

    const { password: _omit, ...userWithoutPassword } = createdUser;

    return {
      user: userWithoutPassword,
    };
  }

  async createAdminRegisterTicket(dto: CreateAdminRegisterTicketDTO) {
    const ticket = await this.adminRegisterTicketRepository.create({
      userName: dto.name,
      userEmail: dto.email,
      status: 'pending',
      payload: {
        user: {
          name: dto.name,
          email: dto.email,
        },
        shelter: {
          name: dto.shelter.name,
          cnpj: dto.shelter.cnpj ?? null,
          contact: dto.shelter.contact,
          address: dto.shelter.address,
          email: dto.shelter.email,
        },
      },
    });

    return ticket;
  }
}
