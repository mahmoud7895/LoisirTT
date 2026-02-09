import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './create-review.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token manquant.');
    }

    const token = authorization.replace('Bearer ', '');
    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token invalide.');
    }

    return this.reviewsService.createReview(createReviewDto, payload.sub);
  }

  @Get(':eventId')
  async getReviewsByEvent(@Param('eventId') eventId: string) {
    console.log('Requête GET /reviews/', eventId);
    const reviews = await this.reviewsService.getReviewsByEvent(
      Number(eventId),
    );
    console.log('Avis récupérés:', reviews);
    return reviews;
  }

  @Get()
  async getAllReviews() {
    return this.reviewsService.getAllReviews();
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token manquant.');
    }

    const token = authorization.replace('Bearer ', '');
    try {
      this.jwtService.verify(token);
      return await this.reviewsService.removeReview(Number(id));
    } catch (error) {
      throw new UnauthorizedException('Token invalide.');
    }
  }
}
