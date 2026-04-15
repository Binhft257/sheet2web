import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShareTokensService } from './share-tokens.service';
import { CreateShareTokenDto } from './dto/create-share-token.dto';
import { UpdateShareTokenDto } from './dto/update-share-token.dto';

@Controller('share-tokens')
export class ShareTokensController {
  constructor(private readonly shareTokensService: ShareTokensService) {}

  @Post()
  create(@Body() createShareTokenDto: CreateShareTokenDto) {
    return this.shareTokensService.create(createShareTokenDto);
  }

  @Get()
  findAll() {
    return this.shareTokensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shareTokensService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShareTokenDto: UpdateShareTokenDto) {
    return this.shareTokensService.update(+id, updateShareTokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shareTokensService.remove(+id);
  }
}
