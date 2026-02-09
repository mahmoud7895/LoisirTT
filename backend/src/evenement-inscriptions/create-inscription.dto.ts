import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  IsPositive,
  IsIn,
} from 'class-validator';

export class CreateInscriptionDto {
  @IsString()
  matricule: string;

  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsInt()
  @IsOptional()
  age?: number | null;

  @IsString()
  beneficiaire: string;

  @IsString()
  payment: string;

  @IsString()
  eventname: string;

  @IsInt()
  eventId: number;

  @IsInt()
  userId: number;

  @IsInt()
  @IsPositive()
  numberOfTickets: number;

  @IsNumber()
  @IsPositive()
  totalAmount: number;
}
