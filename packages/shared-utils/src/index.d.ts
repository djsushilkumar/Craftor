export declare function generateHexUuid(length?: number): string;
export declare function computeSha256(payload: string): string;
export declare const logger: {
  info: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, error?: unknown) => void;
  debug: (message: string, context?: Record<string, unknown>) => void;
};
//# sourceMappingURL=index.d.ts.map
