import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleSheetsMetadata } from './types/google-sheets-metadata.type';

type GoogleSheetProperties = {
  title?: string;
  locale?: string;
  timeZone?: string;
};

type GoogleSheetGridProperties = {
  rowCount?: number;
  columnCount?: number;
};

type GoogleSheetTabProperties = {
  title?: string;
  sheetId?: number;
  index?: number;
  hidden?: boolean;
  sheetType?: string;
  gridProperties?: GoogleSheetGridProperties;
};

@Injectable()
export class GoogleSheetsService {
  constructor(private readonly configService: ConfigService) {}

  async getSpreadsheetMetadata(
    spreadsheetId: string,
  ): Promise<GoogleSheetsMetadata> {
    const apiKey = this.configService.get<string>('GOOGLE_SHEETS_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('Thieu GOOGLE_SHEETS_API_KEY');
    }

    const sheets = this.createSheetsClient(apiKey);

    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields:
          'properties.title,properties.locale,properties.timeZone,sheets.properties',
      });

      const properties = (response.data?.properties ?? {}) as GoogleSheetProperties;
      const rawSheets = (response.data?.sheets ?? []) as Array<{
        properties?: GoogleSheetTabProperties;
      }>;

      const mappedSheets = rawSheets.map((sheet, index) => {
        const sheetProperties = sheet.properties ?? {};
        const gridProperties = sheetProperties.gridProperties ?? {};

        const metadataJson: Record<string, unknown> = {};
        if (typeof gridProperties.rowCount === 'number') {
          metadataJson.rowCount = gridProperties.rowCount;
        }
        if (typeof gridProperties.columnCount === 'number') {
          metadataJson.columnCount = gridProperties.columnCount;
        }
        if (typeof sheetProperties.sheetType === 'string') {
          metadataJson.gridType = sheetProperties.sheetType;
        }

        const googleSheetId =
          typeof sheetProperties.sheetId === 'number'
            ? sheetProperties.sheetId
            : index;

        return {
          sheetName: sheetProperties.title ?? `Sheet ${index + 1}`,
          googleSheetId,
          gid: String(googleSheetId),
          sortOrder:
            typeof sheetProperties.index === 'number'
              ? sheetProperties.index
              : index,
          isHidden: Boolean(sheetProperties.hidden),
          metadataJson,
        };
      });

      return {
        spreadsheetTitle: properties.title ?? '',
        locale: properties.locale,
        timeZone: properties.timeZone,
        sheets: mappedSheets,
      };
    } catch (error) {
      this.handleMetadataError(error);
    }
  }

  async getValues(spreadsheetId: string, range: string): Promise<string[][]> {
    const apiKey = this.configService.get<string>('GOOGLE_SHEETS_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('Thieu GOOGLE_SHEETS_API_KEY');
    }

    const sheets = this.createSheetsClient(apiKey);

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rawValues = response.data?.values;
      if (!Array.isArray(rawValues)) {
        return [];
      }

      return rawValues.map((row) =>
        Array.isArray(row) ? row.map((cell) => String(cell ?? '')) : [],
      );
    } catch (error) {
      this.handleValuesError(error);
    }
  }

  private createSheetsClient(apiKey: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { google } = require('googleapis');
      return google.sheets({ version: 'v4', auth: apiKey });
    } catch {
      throw new InternalServerErrorException(
        'Thieu package googleapis. Hay cai: npm install googleapis',
      );
    }
  }

  private handleMetadataError(error: unknown): never {
    const statusCode = this.getGoogleErrorStatusCode(error);

    if (statusCode === 400 || statusCode === 403 || statusCode === 404) {
      throw new BadRequestException(
        'Khong doc duoc Google Sheet. Hay kiem tra link share public.',
      );
    }

    throw new ServiceUnavailableException(
      'Google Sheets API tam thoi khong kha dung. Vui long thu lai sau.',
    );
  }

  private handleValuesError(error: unknown): never {
    const statusCode = this.getGoogleErrorStatusCode(error);

    if (statusCode === 400 || statusCode === 403 || statusCode === 404) {
      throw new BadRequestException(
        'Khong doc duoc Google Sheet. Hay kiem tra quyen chia se hoac range.',
      );
    }

    throw new ServiceUnavailableException(
      'Google Sheets API tam thoi khong kha dung. Vui long thu lai sau.',
    );
  }

  private getGoogleErrorStatusCode(error: unknown): number | undefined {
    if (!error || typeof error !== 'object') {
      return undefined;
    }

    const status = (error as { code?: unknown }).code;
    if (typeof status === 'number') {
      return status;
    }

    const responseStatus = (error as { response?: { status?: unknown } }).response
      ?.status;
    if (typeof responseStatus === 'number') {
      return responseStatus;
    }

    return undefined;
  }
}
