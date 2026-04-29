import { BadRequestException } from '@nestjs/common';

export const PREVIEW_MAX_ROWS = 100;

const CELL_REGEX = /^([A-Za-z]+)([1-9]\d*)$/;
const CELL_RANGE_REGEX = /^([A-Za-z]+)([1-9]\d*):([A-Za-z]+)([1-9]\d*)$/;
const COLUMN_RANGE_REGEX = /^([A-Za-z]+):([A-Za-z]+)$/;
const ROW_RANGE_REGEX = /^([1-9]\d*):([1-9]\d*)$/;

const INVALID_RANGE_MESSAGE = 'Range A1 khong hop le.';
const RANGE_WITH_SHEET_MESSAGE = 'Khong duoc truyen ten sheet trong range.';
const RANGE_TOO_LARGE_MESSAGE = `Range qua lon. Vui long preview toi da ${PREVIEW_MAX_ROWS} dong.`;

export function escapeSheetName(sheetName: string): string {
  const escapedSheetName = sheetName.replace(/'/g, "''");
  return `'${escapedSheetName}'`;
}

export function buildA1Range(sheetName: string, rangeA1Notation: string): string {
  return `${escapeSheetName(sheetName)}!${rangeA1Notation}`;
}

export function validateRangeA1Notation(
  rangeA1Notation: string,
  maxRows: number = PREVIEW_MAX_ROWS,
): string {
  const normalizedRange = rangeA1Notation.trim();
  if (!normalizedRange) {
    throw new BadRequestException(INVALID_RANGE_MESSAGE);
  }

  if (normalizedRange.includes('!')) {
    throw new BadRequestException(RANGE_WITH_SHEET_MESSAGE);
  }

  const cellMatch = normalizedRange.match(CELL_REGEX);
  if (cellMatch) {
    return normalizedRange;
  }

  const columnRangeMatch = normalizedRange.match(COLUMN_RANGE_REGEX);
  if (columnRangeMatch) {
    return normalizedRange.toUpperCase();
  }

  const rowRangeMatch = normalizedRange.match(ROW_RANGE_REGEX);
  if (rowRangeMatch) {
    const startRow = Number(rowRangeMatch[1]);
    const endRow = Number(rowRangeMatch[2]);
    validateRowRange(startRow, endRow, maxRows);
    return normalizedRange;
  }

  const cellRangeMatch = normalizedRange.match(CELL_RANGE_REGEX);
  if (cellRangeMatch) {
    const startRow = Number(cellRangeMatch[2]);
    const endRow = Number(cellRangeMatch[4]);
    validateRowRange(startRow, endRow, maxRows);
    return normalizedRange.toUpperCase();
  }

  throw new BadRequestException(INVALID_RANGE_MESSAGE);
}

function validateRowRange(startRow: number, endRow: number, maxRows: number) {
  if (startRow > endRow) {
    throw new BadRequestException(INVALID_RANGE_MESSAGE);
  }

  if (endRow - startRow + 1 > maxRows) {
    throw new BadRequestException(RANGE_TOO_LARGE_MESSAGE);
  }
}
