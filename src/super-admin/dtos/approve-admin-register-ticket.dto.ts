import { IsOptional, IsString } from 'class-validator';

export class ApproveAdminRegisterTicketDTO {
  @IsOptional()
  @IsString()
  note?: string;
}
