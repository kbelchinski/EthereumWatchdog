export const matchTransactionToRules = (transaction, rules) => {
  const to = transaction.to?.toLowerCase();
  const from = transaction.to?.toLowerCase();
  const valueEth = Number(transaction.value) / 1e18;
  const gasPriceGwei = Number(transaction.gasPrice) / 1e9;
  const hasData = transaction.data && transaction.data !== '0x';
  const txType = transaction.type;

  return rules.filter(
    (rule) =>
      matchFromAddress(rule, from) &&
      matchToAddress(rule, to) &&
      matchMinValue(rule, valueEth) &&
      matchMaxValue(rule, valueEth) &&
      matchMinGasPrice(rule, gasPriceGwei) &&
      matchDataRequirement(rule, hasData) &&
      matchType(rule, txType),
  );
};

const matchFromAddress = (rule, from) =>
  !rule.from_address || rule.from_address.toLowerCase() === from;

const matchToAddress = (rule, to) =>
  !rule.to_address || rule.to_address.toLowerCase() === to;

const matchMinValue = (rule, valueEth) =>
  !rule.min_value_eth || valueEth >= Number(rule.min_value_eth);

const matchMaxValue = (rule, valueEth) =>
  !rule.max_value_eth || valueEth <= Number(rule.max_value_eth);

const matchMinGasPrice = (rule, gasPriceGwei) =>
  !rule.min_gas_price_gwei || gasPriceGwei >= Number(rule.min_gas_price_gwei);

const matchDataRequirement = (rule, hasData) => !rule.require_data || hasData;

const matchType = (rule, txType) => rule.type === null || rule.type === txType;
