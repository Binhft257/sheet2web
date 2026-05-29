import { PartialType } from '@nestjs/mapped-types';
import { CreateSourceTableDto } from './create-source-table.dto';

export class UpdateSourceTableDto extends PartialType(CreateSourceTableDto) {}
