import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): { message: string } {
    return { message: "Welcome to the App, this is the root path" };
  }

  @Get('app')
  getConnected(): { message: string } {
    return this.appService.getConnectedMessage();
  }

  // @Post('app')
  // postPayloadAndParams(
  //   @Body() payload: any,
  //   @Query() params: Record<string, string>,
  // ): { payload: any; params: Record<string, string> } {
  //   try {
  //     return this.appService.processPayloadAndParams(payload, params);
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
  //   }
  // }
  
  @Post('app/rates')
  async getShippingRates(@Body() payload: { senderState: string, senderPostcode: string; receiverState: string, receiverPostcode: string, weight: string  }): Promise<{ data: { courier: string; rate: number }[], debug: { courier: string, debugMsg: string}[] }> {
    try {
      return await this.appService.fetchShippingRates(payload);
    } catch (error) {
      if (error instanceof HttpException) { throw error; } //notedev: ensure final error is thrown from the API logic if hitting 422
        
      throw new HttpException('Failed to fetch shipping rates', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}