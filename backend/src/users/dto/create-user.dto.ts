import { IsString, Length, Matches, IsIn, IsOptional } from 'class-validator';

const residences = [
  'Espace TT Nabeul',
  'ULS Nabeul Technique',
  'SAAF',
  'SRH',
  'Direction',
] as const;

export class CreateUserDto {
  @IsString()
  @Length(4, 5, { message: 'La matricule doit contenir 4 ou 5 chiffres.' })
  @Matches(/^\d+$/, {
    message: 'La matricule ne doit contenir que des chiffres.',
  })
  matricule: string;

  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsString()
  email: string;

  @IsString()
  telephone: string;

  @IsString()
  login: string;

  @IsOptional() // Rendre motDePasse optionnel
  @IsString()
  motDePasse?: string;

  @IsIn(residences, {
    message: 'Veuillez sélectionner une résidence administrative valide.',
  })
  residenceAdministrative: (typeof residences)[number];
}
