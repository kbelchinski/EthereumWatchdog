import dotenv from 'dotenv';
import { Client } from 'pg';
import prisma from '../../configuration-rules/prisma-client.js';

dotenv.config();

let cachedRules = [];
let readyResolve;

export const ready = new Promise((resolve) => {
  readyResolve = resolve;
});

export const startRuleWatcher = async () => {
  cachedRules = await fetchRulesFromDB();
  readyResolve();

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  await client.query('LISTEN rules_updated');
  client.on('notification', async (msg) => {
    if (msg.channel === 'rules_updated') {
      cachedRules = await fetchRulesFromDB();
      console.log('🔄 Rules updated from DB.');
    }
  });

  console.log('👂 Listening for rule updates...');
};

export const getCachedRules = () => cachedRules;

const fetchRulesFromDB = async () => {
  const rules = await prisma.config_rules.findMany({
    where: { is_active: true },
  });
  console.log(`🔁 Loaded ${rules.length} rules from DB`);
  return rules;
};
