import { ethers } from 'ethers';
import prisma from '../configuration-rules/prisma-client.js';
import { buildTransactionForDBSave } from './helpers/build-transaction-for-db-save.js';
import { calculateRelevantRulesForTransaction } from './helpers/calculate-relevant-rules-for-transaction.js';
import { matchTransactionToRules } from './helpers/rules-matcher.js';

const INFURA_PROJECT_ID = '8059b16544604915b32e6016f90736b4';

const provider = new ethers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
);

const rules = await prisma.config_rules.findMany({
  where: { is_active: true },
});

provider.on('block', async (blockNumber) => {
  try {
    const transactionsBlock = await provider.getBlock(blockNumber, true);
    const insertQueue = [];

    for (const transactionHash of transactionsBlock.transactions) {
      const transaction = await provider.getTransaction(transactionHash);

      const relevantRules = calculateRelevantRulesForTransaction(
        transaction,
        rules,
      );

      const matchedRules = matchTransactionToRules(transaction, relevantRules);

      for (const rule of matchedRules) {
        insertQueue.push(buildTransactionForDBSave(rule, transaction));
      }

      if (insertQueue.length > 0) {
        await prisma.transactions.createMany({
          data: insertQueue,
          skipDuplicates: true,
        });

        console.log(`Inserted ${insertQueue.length} matched transactions`);
      }
    }
  } catch (err) {
    console.error(`Error fetching block ${blockNumber}:`, err);
  }
});
