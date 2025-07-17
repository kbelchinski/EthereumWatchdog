export const buildTransactionForDBSave = (rule, tx) => ({
  tx_hash: tx.hash,
  block_number: tx.blockNumber,
  from_address: tx.from,
  to_address: tx.to,
  value: tx.value.toString(),
  gas_price: BigInt(tx.gasPrice).toString(),
  nonce: tx.nonce,
  rule_id: rule.id,
  matched_at: new Date(),
});
