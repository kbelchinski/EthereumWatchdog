export const configRulesFieldMeta = {
  id: {
    type: 'Int',
    required: false,
    default: 'autoincrement()',
    description: 'Auto-incrementing unique ID',
  },
  name: {
    type: 'String',
    required: true,
    description: 'Name of the rule',
  },
  from_address: {
    type: 'String',
    required: false,
    description: 'Optional Ethereum address (sender)',
    example: '0xabc123...',
  },
  to_address: {
    type: 'String',
    required: false,
    description: 'Optional Ethereum address (receiver)',
    example: '0xdef456...',
  },
  min_value_eth: {
    type: 'Decimal',
    required: false,
    description: 'Minimum ETH value to match',
    example: '0.01',
  },
  max_value_eth: {
    type: 'Decimal',
    required: false,
    description: 'Maximum ETH value to match',
    example: '10.5',
  },
  require_data: {
    type: 'Boolean',
    required: false,
    default: false,
    description: 'Whether the transaction must contain input data',
  },
  min_gas_price_gwei: {
    type: 'Decimal',
    required: false,
    description: 'Minimum gas price (in gwei)',
    example: '15.0',
  },
  type: {
    type: 'Int',
    required: false,
    description: 'Custom integer code or enum type for categorizing the rule',
    example: 1,
  },
  is_active: {
    type: 'Boolean',
    required: false,
    default: true,
    description: 'Whether the rule is currently active',
  },
  created_at: {
    type: 'DateTime',
    required: false,
    default: 'now()',
    description: 'Timestamp when the rule was created',
  },
  updated_at: {
    type: 'DateTime',
    required: false,
    default: 'now()',
    description: 'Timestamp when the rule was last updated',
  },
  transactions: {
    type: 'transactions[]',
    required: false,
    description: 'List of related transactions (read-only relation)',
  },
};
