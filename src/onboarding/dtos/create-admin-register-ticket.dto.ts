import { Type } from 'class-transformer';
import {
  IsEmail,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ShelterAddressPayloadDTO {
  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  zipCode!: string;

  @IsString()
  @IsNotEmpty()
  number!: string;

  @IsOptional()
  @IsString()
  apartment?: string;
}

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

  @ValidateNested()
  @Type(() => ShelterAddressPayloadDTO)
  address!: ShelterAddressPayloadDTO;

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

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ValidateNested()
  @Type(() => ShelterPayloadDTO)
  shelter!: ShelterPayloadDTO;
}
