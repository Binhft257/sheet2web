import { PartialType } from '@nestjs/mapped-types';
import { CreateCellChangeLogDto } from './create-cell-change-log.dto';

export class UpdateCellChangeLogDto extends PartialType(CreateCellChangeLogDto) {}
