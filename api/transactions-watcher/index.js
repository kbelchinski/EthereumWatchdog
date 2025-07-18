import { ethers } from 'ethers';
import pino from 'pino';
import prisma from '../common/prisma-client.js';
import { buildTransactionForDBSave } from './helpers/build-transaction-for-db-save.js';
import { calculateRelevantRulesForTransaction } from './helpers/calculate-relevant-rules-for-transaction.js';
import {
  getCachedRules,
  ready,
  startRuleWatcher,
} from './helpers/rules-fetch-and-notify.js';
import { matchTransactionToRules } from './helpers/rules-matcher.js';

const logger = pino({
  name: 'txwatcher',
  level: process.env.LOG_LEVEL || 'info',
});

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

console.log(INFURA_PROJECT_ID);

const provider = new ethers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
);

await startRuleWatcher();
await ready;

logger.info('📡 Rule watcher initialized and ready');

provider.on('block', async (blockNumber) => {
  const rules = getCachedRules();

  console.log(`${rules.length}`);
  logger.info(
    { blockNumber, ruleCount: rules.length },
    '📦 New block received',
  );

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
    }

    if (insertQueue.length > 0) {
      const result = await prisma.transactions.createMany({
        data: insertQueue,
        skipDuplicates: true,
      });

      logger.info(
        {
          inserted: result.count,
          totalMatched: insertQueue.length,
        },
        '📝 Transactions inserted to DB (deduplicated)',
      );
    }
  } catch (err) {
    logger.error({ err, blockNumber }, '❌ Error fetching or processing block');
  }
});
