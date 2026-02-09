import { IsNumber, IsString, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateClubDto {
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

  @IsString() // Nouveau champ optionnel
  @IsOptional()
  beneficiaire?: string;

  @IsNumber()
  @Transform(({ value }) => (value === '' ? null : Number(value)))
  @IsOptional()
  type_club_id?: number | null;
}
