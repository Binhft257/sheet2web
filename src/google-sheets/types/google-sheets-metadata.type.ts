export type GoogleSheetTabMetadata = {
  sheetName: string;
  googleSheetId: number;
  gid: string;
  sortOrder: number;
  isHidden: boolean;
  metadataJson: Record<string, unknown>;
};

export type GoogleSheetsMetadata = {
  spreadsheetTitle: string;
  locale?: string;
  timeZone?: string;
  sheets: GoogleSheetTabMetadata[];
};
