declare module 'fit-file-parser' {
  export interface FitParserOptions {
    force?: boolean;
    speedUnit?: string;
    lengthUnit?: string;
    temperatureUnit?: string;
    elapsedRecordField?: boolean;
    mode?: string;
  }

  export default class FitParser {
    constructor(options?: FitParserOptions);
    parse(
      buffer: Buffer,
      callback: (error: Error | null, data: unknown) => void
    ): void;
  }
}
