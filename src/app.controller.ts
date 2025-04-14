import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { TokenGuard } from './utils/token.guard';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RateRequestDto, RateResponseDto } from './swagger/rate.dto';
import { TokenResponseDto } from './swagger/token.dto';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiResponse({ status: 200, description: 'Welcome message', type: Object })
  getRoot(): { message: string } {
    return { message: "Welcome to the App, this is the root path" };
  }

  @Get('app')
  @ApiOperation({ summary: 'Check server connection' })
  @ApiResponse({ status: 200, description: 'Connection status', type: Object })
  getConnected(): { message: string } {
    return this.appService.getConnectedMessage();
  }

  @Post('app/generate-token')
  @ApiOperation({ summary: 'Generate a new authentication token' })
  @ApiResponse({ status: 200, description: 'Generated token and expiration', type: TokenResponseDto })
  @ApiResponse({ status: 500, description: 'Failed to generate token' })
  async generateToken(): Promise<{ token: string; expiresAt: string }> {
    return await this.appService.generateToken();
  }

  @Post('app/rates')
  @UseGuards(TokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch shipping rates (requires token)' })
  @ApiBody({ type: RateRequestDto })
  @ApiResponse({ status: 200, description: 'Shipping rates and debug info', type: RateResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized (missing or invalid token)' })
  @ApiResponse({ status: 422, description: 'Invalid payload' })
  async getShippingRates(@Body() payload: { senderState: string, senderPostcode: string; receiverState: string, receiverPostcode: string, weight: string  }): Promise<{ data: { courier: string; rate: number }[], debug: { courier: string, debugMsg: string}[] }> {
    return await this.appService.fetchShippingRates(payload);
  }
}