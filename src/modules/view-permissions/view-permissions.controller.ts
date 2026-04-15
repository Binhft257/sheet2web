import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ViewPermissionsService } from './view-permissions.service';
import { CreateViewPermissionDto } from './dto/create-view-permission.dto';
import { UpdateViewPermissionDto } from './dto/update-view-permission.dto';

@Controller('view-permissions')
export class ViewPermissionsController {
  constructor(private readonly viewPermissionsService: ViewPermissionsService) {}

  @Post()
  create(@Body() createViewPermissionDto: CreateViewPermissionDto) {
    return this.viewPermissionsService.create(createViewPermissionDto);
  }

  @Get()
  findAll() {
    return this.viewPermissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.viewPermissionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateViewPermissionDto: UpdateViewPermissionDto) {
    return this.viewPermissionsService.update(+id, updateViewPermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.viewPermissionsService.remove(+id);
  }
}
