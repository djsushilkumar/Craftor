export const DRAFT_07_SCHEMA_URI = 'http://json-schema.org/draft-07/schema#' as const;

export const JSON_RPC_ID_SCHEMA = {
  type: ['string', 'number', 'null'],
  description: 'Unique JSON-RPC 2.0 request identifier.',
} as const;

export const JSON_RPC_VERSION_SCHEMA = {
  type: 'string',
  enum: ['2.0'],
  description: 'JSON-RPC version must be strictly 2.0.',
} as const;
