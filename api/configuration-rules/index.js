import dotenv from 'dotenv';
import express from 'express';
import { ZodError } from 'zod';
import logger from '../common/logger.js';
import prisma from '../common/prisma-client.js';
import { configRulesFieldMeta } from './error-handling/config-rule-metadata.js';
import {
  configRulesSchema,
  updateConfigRulesSchema,
} from './error-handling/config-rule-shemas.js';

dotenv.config();
const app = express();
app.use(express.json());

app.get('/api/rules', async (_, res) => {
  try {
    const configRules = await prisma.config_rules.findMany();
    logger.info('Fetched all config rules');
    res.json(configRules);
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch config rules');
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

app.get('/api/rules/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const rule = await prisma.config_rules.findUnique({ where: { id } });

  if (!rule) {
    logger.warn({ id }, 'Rule not found');
    return res.status(404).json({ error: 'Rule not found' });
  }

  logger.info({ id }, 'Fetched rule');
  res.json(rule);
});

app.post('/api/rules', async (req, res) => {
  try {
    const validatedData = configRulesSchema.parse(req.body);
    const rule = await prisma.config_rules.create({ data: validatedData });

    logger.info({ id: rule.id }, 'Created new rule');
    res.status(201).json(rule);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedDetails = formatValidationErrors(
        error,
        configRulesFieldMeta,
      );

      logger.warn({ error: formattedDetails }, 'Validation failed');
      return res.status(400).json({
        error: 'Validation failed',
        details: formattedDetails,
      });
    }

    logger.error({ err: error }, 'Error creating rule');
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/rules/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    logger.warn('Invalid rule ID provided');
    return res.status(400).json({ error: 'Invalid rule ID' });
  }

  try {
    const validatedData = updateConfigRulesSchema.parse(req.body);
    const updatedRule = await prisma.config_rules.update({
      where: { id },
      data: validatedData,
    });

    logger.info({ id }, 'Updated rule');
    res.json(updatedRule);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedDetails = formatValidationErrors(
        error,
        configRulesFieldMeta,
      );

      logger.warn({ error: formattedDetails }, 'Validation failed');
      return res.status(400).json({
        error: 'Validation failed',
        details: formattedDetails,
      });
    }

    if (error.code === 'P2025') {
      logger.warn({ id }, 'Rule not found for update');
      return res.status(404).json({ error: 'Rule not found' });
    }

    logger.error({ err: error }, 'Failed to update rule');
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/rules/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.config_rules.delete({ where: { id } });
    logger.info({ id }, 'Deleted rule');
    res.status(204).end();
  } catch (error) {
    logger.error({ err: error, id }, 'Failed to delete rule');
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});
