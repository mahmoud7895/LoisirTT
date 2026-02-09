import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  IsPositive,
  IsIn,
} from 'class-validator';

export class UpdateInscriptionDto {
  @IsString()
  @IsOptional()
  matricule?: string;

  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  prenom?: string;

  @IsInt()
  @IsOptional()
  age?: number | null;

  @IsString()
  @IsIn(['Agent TT', 'enfant'], { message: "Le bénéficiaire doit être 'Agent TT' ou 'enfant'." })
  @IsOptional()
  beneficiaire?: string;

  @IsString()
  @IsIn(['creditCard', 'paypal', 'cash'], { message: 'Le mode de paiement doit être valide.' })
  @IsOptional()
  payment?: string;

  @IsString()
  @IsOptional()
  eventname?: string;

  @IsInt()
  @IsOptional()
  eventId?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  numberOfTickets?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsIn(['En cours', 'Expiré'], { message: "Le statut doit être 'En cours' ou 'Expiré'." })
  @IsOptional()
  eventStatus?: string;
}