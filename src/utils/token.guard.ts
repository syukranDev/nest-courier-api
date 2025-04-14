import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Sequelize, Op } from 'sequelize';
import { Sequelize as SequelizeTs } from 'sequelize-typescript';
import { Token } from '../model/token.model';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private sequelize: SequelizeTs) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException('Missing or invalid Authorization header', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];

    const tokenRecord = await Token.findOne({
      where: {
        token,
        expiresAt: {
          [Op.gte]: new Date(),
        },
      },
    });

    if (!tokenRecord) {
      throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}