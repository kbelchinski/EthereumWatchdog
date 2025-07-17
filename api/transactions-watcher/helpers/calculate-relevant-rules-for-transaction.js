export const calculateRelevantRulesForTransaction = (tx, rules) =>
  rules.filter((rule) => {
    const from = tx.from?.toLowerCase();
    const to = tx.to?.toLowerCase();

    const fromMatch =
      !rule.from_address || rule.from_address.toLowerCase() === from;
    const toMatch = !rule.to_address || rule.to_address.toLowerCase() === to;
    const typeMatch = rule.type == null || rule.type === tx.type;

    return fromMatch && toMatch && typeMatch;
  });
