import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  AdminRegisterTicketStatus,
  Prisma,
  SubscriptionStatus,
  UserRole,
} from '@prisma/client';
import { AdminRegisterTicketRepository } from '../common/repositories/admin-register-ticket.repository';
import { PrismaService } from '../common/prisma.service';
import { ShelterRepository } from '../common/repositories/shelter.repository';
import { TenantRepository } from '../common/repositories/tenant.repository';
import { UserRepository } from '../common/repositories/user.repository';
import { EmailService } from '../common/services/email.service';
import { generateTemporaryPassword } from '../common/utils/generate-temporary-password';

type TicketPayload = {
  user: {
    name: string;
    email: string;
  };
  shelter: {
    name: string;
    cnpj?: string;
    contact: string;
    address:
      | {
          street: string;
          city: string;
          state: string;
          zipCode: string;
          number: string;
          apartment?: string | null;
        }
      | string;
    email: string;
  };
};

@Injectable()
export class RegisterTicketsService {
  constructor(
    private readonly adminRegisterTicketRepository: AdminRegisterTicketRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly shelterRepository: ShelterRepository,
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  getAll() {
    return this.adminRegisterTicketRepository.findAll({
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(ticketId: number) {
    const result = await this.prisma.$transaction(
      async (tx) => {
        const ticket = await this.adminRegisterTicketRepository.findById(
          ticketId,
          tx,
        );
        if (!ticket) throw new NotFoundException('Ticket não encontrado');
        if (ticket.status !== AdminRegisterTicketStatus.pending) {
          return { kind: 'unchanged' as const, ticket };
        }

        const plainPassword = generateTemporaryPassword(10);
        const passwordHash = await bcrypt.hash(plainPassword, 10);
        const payload = ticket.payload as Prisma.JsonObject as TicketPayload;
        const normalizedAddress = normalizeAddressPayload(
          payload.shelter.address,
        );

        const tenant = await this.tenantRepository.create(
          {
            name: payload.shelter.name,
            address: normalizedAddress,
            subscriptionStatus: SubscriptionStatus.trialing,
          },
          tx,
        );

        await this.shelterRepository.create(
          {
            name: payload.shelter.name,
            cnpj: payload.shelter.cnpj,
            contact: payload.shelter.contact,
            address: normalizedAddress,
            email: payload.shelter.email,
            tenant: { connect: { id: tenant.id } },
          },
          tx,
        );

        await this.userRepository.create(
          {
            name: payload.user.name,
            email: payload.user.email,
            password: passwordHash,
            role: UserRole.shelter_admin,
            tenant: { connect: { id: tenant.id } },
          },
          tx,
        );

        const updated = await this.adminRegisterTicketRepository.update(
          ticketId,
          {
            status: AdminRegisterTicketStatus.approved,
            reviewedAt: new Date(),
          },
          tx,
        );

        const loginBase =
          process.env.APP_PUBLIC_LOGIN_URL?.replace(/\/$/, '') ??
          'http://localhost:5173/login';
        const body = `<p>Olá, ${escapeHtml(payload.user.name)},</p>
<p>Sua solicitação de cadastro como <strong>administrador de abrigo</strong> foi <strong>aprovada</strong>.</p>
<p>Use os dados abaixo para acessar o AdotaPet:</p>
<ul>
  <li><strong>E-mail:</strong> ${escapeHtml(payload.user.email)}</li>
  <li><strong>Senha temporária:</strong> ${escapeHtml(plainPassword)}</li>
</ul>
<p><a href="${escapeAttr(loginBase)}">Acessar login</a></p>
<p>Por segurança, altere a senha após o primeiro acesso.</p>`;

        await this.emailService.sendEmail(
          body,
          'AdotaPet — sua conta de abrigo foi aprovada',
          [payload.user.email],
        );

        return { kind: 'approved' as const, ticket: updated };
      },
      {
        maxWait: 10_000,
        timeout: 60_000,
      },
    );

    return result.ticket;
  }

  async reject(ticketId: number) {
    const ticket = await this.adminRegisterTicketRepository.findById(ticketId);
    if (!ticket) throw new NotFoundException('Ticket não encontrado');
    if (ticket.status !== AdminRegisterTicketStatus.pending) return ticket;
    return this.adminRegisterTicketRepository.update(ticketId, {
      status: AdminRegisterTicketStatus.rejected,
      reviewedAt: new Date(),
    });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Atributo href: aspas e `&` */
function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function normalizeAddressPayload(payload: TicketPayload['shelter']['address']) {
  if (typeof payload === 'string') {
    return {
      street: payload,
      city: '',
      state: '',
      zipCode: '',
      number: '',
      apartment: null,
    };
  }
  return {
    street: payload?.street ?? '',
    city: payload?.city ?? '',
    state: payload?.state ?? '',
    zipCode: payload?.zipCode ?? '',
    number: payload?.number ?? '',
    apartment: payload?.apartment ?? null,
  };
}
