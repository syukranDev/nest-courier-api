import { ApiProperty } from '@nestjs/swagger';

export class RateRequestDto {
  @ApiProperty({ description: 'State of the sender', example: 'Perlis' })
  senderState: string;

  @ApiProperty({ description: 'Postcode of the sender', example: '02000' })
  senderPostcode: string;

  @ApiProperty({ description: 'State of the receiver', example: 'Perak' })
  receiverState: string;

  @ApiProperty({ description: 'Postcode of the receiver', example: '32400' })
  receiverPostcode: string;

  @ApiProperty({ description: 'Weight of the parcel in kg', example: '2' })
  weight: string;
}

export class CourierRate {
  @ApiProperty({ description: 'Name of the courier', example: 'Citylink' })
  courier: string;

  @ApiProperty({ description: 'Shipping rate in MYR', example: 13 })
  rate: number;
}

export class DebugMessage {
  @ApiProperty({ description: 'Name of the courier', example: 'J&T' })
  courier: string;

  @ApiProperty({ description: 'Error message if the request failed', example: 'Request failed with status code 403' })
  debugMsg: string;
}

export class RateResponseDto {
  @ApiProperty({ description: 'List of courier rates', type: [CourierRate] })
  data: CourierRate[];

  @ApiProperty({ description: 'List of debug messages for failed requests', type: [DebugMessage] })
  debug: DebugMessage[];
}