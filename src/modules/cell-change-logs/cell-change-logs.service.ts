import { Injectable } from '@nestjs/common';
import { CreateCellChangeLogDto } from './dto/create-cell-change-log.dto';
import { UpdateCellChangeLogDto } from './dto/update-cell-change-log.dto';

@Injectable()
export class CellChangeLogsService {
  create(createCellChangeLogDto: CreateCellChangeLogDto) {
    return 'This action adds a new cellChangeLog';
  }

  findAll() {
    return `This action returns all cellChangeLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cellChangeLog`;
  }

  update(id: number, updateCellChangeLogDto: UpdateCellChangeLogDto) {
    return `This action updates a #${id} cellChangeLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} cellChangeLog`;
  }
}
