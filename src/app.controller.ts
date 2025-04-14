import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { TokenGuard } from './utils/token.guard';

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

  @Post('app/generate-token')
  async generateToken(): Promise<{ token: string; expiresAt: string }> {
    return await this.appService.generateToken();
  }

  @Post('app/rates')
  @UseGuards(TokenGuard)
  async getShippingRates(@Body() payload: { senderState: string, senderPostcode: string; receiverState: string, receiverPostcode: string, weight: string  }): Promise<{ data: { courier: string; rate: number }[], debug: { courier: string, debugMsg: string}[] }> {
    return await this.appService.fetchShippingRates(payload);
  }
}