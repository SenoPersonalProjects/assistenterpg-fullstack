import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SecurityCleanupService } from './security-cleanup.service';
import { SecurityRateLimitGuard } from './security-rate-limit.guard';
import { SecurityRateLimitService } from './security-rate-limit.service';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    SecurityRateLimitService,
    SecurityRateLimitGuard,
    SecurityCleanupService,
  ],
  exports: [SecurityRateLimitService, SecurityRateLimitGuard],
})
export class SecurityModule {}
