import { PartialType } from '@nestjs/mapped-types';
import { CreateShareTokenDto } from './create-share-token.dto';

export class UpdateShareTokenDto extends PartialType(CreateShareTokenDto) {}
