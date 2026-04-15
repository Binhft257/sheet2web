import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourceTablesModule } from './modules/source-tables/source-tables.module';
import { ViewsModule } from './modules/views/views.module';
import { ViewSnapshotsModule } from './modules/view-snapshots/view-snapshots.module';
import { ViewPermissionsModule } from './modules/view-permissions/view-permissions.module';
import { SyncHistoriesModule } from './modules/sync-histories/sync-histories.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { CellChangeLogsModule } from './modules/cell-change-logs/cell-change-logs.module';
import { DataSourcesModule } from './modules/data-sources/data-sources.module';
import { ShareTokensModule } from './modules/share-tokens/share-tokens.module';
import { SourceSheetsModule } from './modules/source-sheets/source-sheets.module';
import { ThemesModule } from './modules/themes/themes.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule,
    SourceTablesModule,
    SyncHistoriesModule,
    ViewPermissionsModule,
    ViewSnapshotsModule,
    ViewsModule,
    AuditLogsModule,
    CellChangeLogsModule,
    DataSourcesModule,
    ShareTokensModule,
    SourceSheetsModule,
    ThemesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
