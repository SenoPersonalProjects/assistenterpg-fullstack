import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegistrarErroClienteDto } from './dto/registrar-erro-cliente.dto';
import { ObservabilidadeService } from './observabilidade.service';

@UseGuards(AuthGuard('jwt'))
@Controller('observabilidade')
export class ObservabilidadeController {
  constructor(
    private readonly observabilidadeService: ObservabilidadeService,
  ) {}

  @Post('erros-cliente')
  @HttpCode(204)
  registrarErroCliente(
    @Request() req: { user: { id: number } },
    @Body() dto: RegistrarErroClienteDto,
  ): void {
    this.observabilidadeService.registrarErroCliente(req.user.id, dto);
  }
}
