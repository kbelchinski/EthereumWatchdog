import zod from 'zod';

const ethAddress = zod.string().regex(/^0x[a-fA-F0-9]{40}$/, {
  message: 'Invalid Ethereum address.',
});

export const configRulesSchema = zod.object({
  name: zod.string().min(1, 'Name is required.'),

  from_address: ethAddress.optional(),
  to_address: ethAddress.optional(),

  min_value_eth: zod.union([zod.string(), zod.number()]).optional(),
  max_value_eth: zod.union([zod.string(), zod.number()]).optional(),

  require_data: zod.boolean().optional(),

  min_gas_price_gwei: zod.union([zod.string(), zod.number()]).optional(),

  type: zod.number().int().optional(),

  is_active: zod.boolean().optional(),

  created_at: zod.coerce.date().optional(),
  updated_at: zod.coerce.date().optional(),
});

export const updateConfigRulesSchema = configRulesSchema.partial();
