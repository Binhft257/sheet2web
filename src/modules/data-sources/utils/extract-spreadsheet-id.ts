import { BadRequestException } from '@nestjs/common';

const INVALID_URL_MESSAGE = 'Google Sheet URL không hợp lệ';
const GOOGLE_SHEET_HOST = 'docs.google.com';
const GOOGLE_SHEET_PATH_REGEX =
  /^\/spreadsheets\/d\/([a-zA-Z0-9-_]+)(?:\/[^?#]*)?$/;

export function extractSpreadsheetId(sourceUrl: string): string {
  if (!sourceUrl || !sourceUrl.trim()) {
    throw new BadRequestException(INVALID_URL_MESSAGE);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(sourceUrl.trim());
  } catch {
    throw new BadRequestException(INVALID_URL_MESSAGE);
  }

  if (parsedUrl.hostname !== GOOGLE_SHEET_HOST) {
    throw new BadRequestException(INVALID_URL_MESSAGE);
  }

  const matchedPath = parsedUrl.pathname.match(GOOGLE_SHEET_PATH_REGEX);
  const spreadsheetId = matchedPath?.[1];

  if (!spreadsheetId) {
    throw new BadRequestException(INVALID_URL_MESSAGE);
  }

  return spreadsheetId;
}
