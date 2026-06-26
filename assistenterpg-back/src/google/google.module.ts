import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleOAuthService } from './google-oauth.service';
import { GoogleTokenCryptoService } from './google-token-crypto.service';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    GoogleOAuthService,
    GoogleTokenCryptoService,
    GoogleCalendarService,
  ],
  exports: [
    GoogleOAuthService,
    GoogleTokenCryptoService,
    GoogleCalendarService,
  ],
})
export class GoogleModule {}
