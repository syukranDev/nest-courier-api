import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): { message: string } {
    return { message: "Welcome to the App" };
  }

  @Get('app')
  getConnected(): { message: string } {
    return this.appService.getConnectedMessage();
  }

  @Post('app')
  postPayloadAndParams(
    @Body() payload: any,
    @Query() params: Record<string, string>,
  ): { payload: any; params: Record<string, string> } {
    try {
      return this.appService.processPayloadAndParams(payload, params);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}