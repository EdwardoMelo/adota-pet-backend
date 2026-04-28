import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ShelterPayloadDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsString()
  @IsNotEmpty()
  contact!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class CreateAdminRegisterTicketDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ValidateNested()
  @Type(() => ShelterPayloadDTO)
  shelter!: ShelterPayloadDTO;
}
