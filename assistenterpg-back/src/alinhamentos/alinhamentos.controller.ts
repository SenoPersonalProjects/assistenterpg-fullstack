import { Controller, Get, UseGuards} from '@nestjs/common';
import { AlinhamentosService } from './alinhamentos.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))

@Controller('alinhamentos')
export class AlinhamentosController {
  constructor(private readonly alinhamentosService: AlinhamentosService) {}

  @Get()
  findAll() {
    return this.alinhamentosService.findAll();
  }
}
