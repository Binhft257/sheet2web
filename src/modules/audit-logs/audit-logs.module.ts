import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditLogsService],
})
export class AuditLogsModule {}
