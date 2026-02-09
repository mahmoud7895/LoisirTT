import { Transform } from 'class-transformer';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateEvenementDto {
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @IsString()
  @IsNotEmpty()
  eventDate: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  eventLocation: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  ticketNumber: number;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  ticketPrice: number;
}
