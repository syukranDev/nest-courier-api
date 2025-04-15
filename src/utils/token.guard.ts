import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Sequelize, Op } from 'sequelize';
import { Sequelize as SequelizeTs } from 'sequelize-typescript';
import { Token } from '../model/token.model';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private sequelize: SequelizeTs,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.error('Missing or invalid Authorization header', {});
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
      this.logger.error('Invalid or expired token', {});
      throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}