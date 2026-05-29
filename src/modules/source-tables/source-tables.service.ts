import { Injectable } from '@nestjs/common';
import { CreateSourceTableDto } from './dto/create-source-table.dto';
import { UpdateSourceTableDto } from './dto/update-source-table.dto';

@Injectable()
export class SourceTablesService {
  create(createSourceTableDto: CreateSourceTableDto) {
    return 'This action adds a new sourceTable';
  }

  findAll() {
    return `This action returns all sourceTables`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sourceTable`;
  }

  update(id: number, updateSourceTableDto: UpdateSourceTableDto) {
    return `This action updates a #${id} sourceTable`;
  }

  remove(id: number) {
    return `This action removes a #${id} sourceTable`;
  }
}
