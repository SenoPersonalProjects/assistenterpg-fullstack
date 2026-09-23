import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { HealthService, type HealthStatus } from './health.service';
import { RegistrarBackupOperacionalDto } from './dto/registrar-backup-operacional.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  live(): HealthStatus {
    return this.healthService.live();
  }

  @Get('ready')
  ready(): Promise<HealthStatus> {
    return this.healthService.ready();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  administrativo() {
    return this.healthService.administrativo();
  }

  @Post('backups')
  registrarBackup(
    @Headers('x-backup-status-token') token: string | undefined,
    @Body() dto: RegistrarBackupOperacionalDto,
  ) {
    return this.healthService.registrarBackup(token, dto);
  }
}
