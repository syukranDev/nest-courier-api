import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ description: 'Generated token', example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6' })
  token: string;

  @ApiProperty({ description: 'Token expiration date in ISO format', example: '2025-04-15T12:00:00.000Z' })
  expiresAt: string;
}