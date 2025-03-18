import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        private readonly prisma: PrismaService,
        configService: ConfigService
    ) {
        const secretOrKey = configService.get('JWT_SECRET');
        if (!secretOrKey) {
          throw new Error('JWT_SECRET is not defined in the configuration');
        }
    
        super({
          secretOrKey,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }


    async validate( payload: JwtPayload ): Promise<User> {
        
        const { id } = payload;

        const user = await this.prisma.user.findUnique({ where: {id} });

        if ( !user ) 
            throw new UnauthorizedException('Token not valid')


        return user;
    }

}