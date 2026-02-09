import { IsInt, IsString, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  eventId: number;

  @IsInt()
  userId: number;

  @IsString()
  @IsNotEmpty()
  matricule: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
