import { PartialType } from '@nestjs/swagger';
import { CreateSourceSheetDto } from './create-source-sheet.dto';

export class UpdateSourceSheetDto extends PartialType(CreateSourceSheetDto) {}
