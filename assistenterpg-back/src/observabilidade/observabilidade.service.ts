import { Injectable, Logger } from '@nestjs/common';
import { RegistrarErroClienteDto } from './dto/registrar-erro-cliente.dto';

@Injectable()
export class ObservabilidadeService {
  private readonly logger = new Logger(ObservabilidadeService.name);

  registrarErroCliente(usuarioId: number, dto: RegistrarErroClienteDto): void {
    this.logger.warn(
      JSON.stringify({
        evento: 'erro_cliente',
        usuarioId,
        tipo: dto.tipo,
        rota: dto.rota,
        versao: dto.versao,
        em: dto.em,
        mensagem: dto.mensagem,
      }),
    );
  }
}
