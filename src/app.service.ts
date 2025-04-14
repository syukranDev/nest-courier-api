import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getConnectedMessage(): { message: string } {
    return { message: "Connected to the server" };
  }

  processPayloadAndParams(payload: any, params: Record<string, string>): { payload: any; params: Record<string, string> } {
    if (!payload && Object.keys(params).length === 0) {
      throw new Error('No payload or URL parameters provided');
    }
    return { payload, params };
  }
  
}