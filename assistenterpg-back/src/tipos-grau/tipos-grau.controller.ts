import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TiposGrauService } from './tipos-grau.service';
import { CreateTipoGrauDto } from './dto/create-tipo-grau.dto';
import { UpdateTipoGrauDto } from './dto/update-tipo-grau.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('tipos-grau')
export class TiposGrauController {
  constructor(private readonly tiposGrauService: TiposGrauService) {}

  @Post()
  create(@Body() dto: CreateTipoGrauDto) {
    return this.tiposGrauService.create(dto);
  }

  @Get()
  findAll() {
    return this.tiposGrauService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiposGrauService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTipoGrauDto) {
    return this.tiposGrauService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiposGrauService.remove(+id);
  }
}
