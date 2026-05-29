import { PartialType } from '@nestjs/mapped-types';
import { CreateSourceSheetDto } from './create-source-sheet.dto';

export class UpdateSourceSheetDto extends PartialType(CreateSourceSheetDto) {}
