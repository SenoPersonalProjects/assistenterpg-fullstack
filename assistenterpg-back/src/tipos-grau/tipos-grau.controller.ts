import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tiposGrauService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoGrauDto,
  ) {
    return this.tiposGrauService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tiposGrauService.remove(id);
  }
}
