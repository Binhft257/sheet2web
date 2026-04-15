import { Injectable } from '@nestjs/common';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Injectable()
export class DataSourcesService {
  create(createDataSourceDto: CreateDataSourceDto) {
    return 'This action adds a new dataSource';
  }

  findAll() {
    return `This action returns all dataSources`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dataSource`;
  }

  update(id: number, updateDataSourceDto: UpdateDataSourceDto) {
    return `This action updates a #${id} dataSource`;
  }

  remove(id: number) {
    return `This action removes a #${id} dataSource`;
  }
}
