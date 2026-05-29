import { Injectable } from '@nestjs/common';
import { CreateSourceSheetDto } from './dto/create-source-sheet.dto';
import { UpdateSourceSheetDto } from './dto/update-source-sheet.dto';

@Injectable()
export class SourceSheetsService {
  create(createSourceSheetDto: CreateSourceSheetDto) {
    return 'This action adds a new sourceSheet';
  }

  findAll() {
    return `This action returns all sourceSheets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sourceSheet`;
  }

  update(id: number, updateSourceSheetDto: UpdateSourceSheetDto) {
    return `This action updates a #${id} sourceSheet`;
  }

  remove(id: number) {
    return `This action removes a #${id} sourceSheet`;
  }
}
