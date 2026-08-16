export declare const JSON_RPC_2_0_SCHEMA: {
  readonly $schema: 'http://json-schema.org/draft-07/schema#';
  readonly title: 'JsonRpcRequest';
  readonly type: 'object';
  readonly required: readonly ['jsonrpc', 'method', 'id'];
  readonly properties: {
    readonly jsonrpc: {
      readonly type: 'string';
      readonly enum: readonly ['2.0'];
    };
    readonly method: {
      readonly type: 'string';
    };
    readonly id: {
      readonly type: readonly ['string', 'number'];
    };
    readonly params: {
      readonly type: 'object';
    };
  };
};
export declare const TOOL_REGISTRY_ENTRY_SCHEMA: {
  readonly $schema: 'http://json-schema.org/draft-07/schema#';
  readonly title: 'ToolRegistryEntry';
  readonly type: 'object';
  readonly required: readonly ['id', 'version', 'category', 'permissions', 'inputs', 'outputs'];
  readonly properties: {
    readonly id: {
      readonly type: 'string';
      readonly pattern: '^[a-z0-9_]+$';
    };
    readonly version: {
      readonly type: 'string';
      readonly pattern: '^\\d+\\.\\d+\\.\\d+$';
    };
    readonly category: {
      readonly type: 'string';
    };
    readonly permissions: {
      readonly type: 'array';
      readonly items: {
        readonly type: 'string';
      };
    };
    readonly deprecated: {
      readonly type: 'boolean';
      readonly default: false;
    };
    readonly inputs: {
      readonly type: 'object';
    };
    readonly outputs: {
      readonly type: 'object';
    };
  };
};
export declare const ELEMENTOR_CONTAINER_MUTATION_SCHEMA: {
  readonly $schema: 'http://json-schema.org/draft-07/schema#';
  readonly title: 'ElementorContainerMutation';
  readonly type: 'object';
  readonly required: readonly ['page_id', 'flex_direction'];
  readonly properties: {
    readonly page_id: {
      readonly type: 'integer';
      readonly minimum: 1;
    };
    readonly flex_direction: {
      readonly type: 'string';
      readonly enum: readonly ['row', 'column', 'row-reverse', 'column-reverse'];
    };
    readonly justify_content: {
      readonly type: 'string';
      readonly enum: readonly [
        'flex-start',
        'center',
        'flex-end',
        'space-between',
        'space-around',
        'space-evenly',
      ];
    };
    readonly align_items: {
      readonly type: 'string';
      readonly enum: readonly ['flex-start', 'center', 'flex-end', 'stretch'];
    };
  };
};
//# sourceMappingURL=index.d.ts.map
