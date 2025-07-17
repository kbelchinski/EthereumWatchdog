// index.js
import dotenv from 'dotenv';
import express from 'express';
import { ZodError } from 'zod';
import { configRulesFieldMeta } from './error-handling/config-rule-metadata.js';
import {
  configRulesSchema,
  updateConfigRulesSchema,
} from './error-handling/config-rule-shemas.js';
import prisma from './prisma-client.js';

dotenv.config();
const app = express();
app.use(express.json());

app.get('/api/rules', async (_, res) => {
  try {
    const configRules = await prisma.config_rules.findMany();

    res.json(configRules);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

app.get('/api/rules/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const rule = await prisma.config_rules.findUnique({ where: { id } });

  if (!rule) return res.status(404).json({ error: 'Rule not found' });

  res.json(rule);
});

app.post('/api/rules', async (req, res) => {
  try {
    const validatedData = configRulesSchema.parse(req.body);
    const rule = await prisma.config_rules.create({ data: validatedData });

    res.status(201).json(rule);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedDetails = formatValidationErrors(
        error,
        configRulesFieldMeta,
      );

      return res.status(400).json({
        error: 'Validation failed',
        details: formattedDetails,
      });
    }
  }
});

app.put('/api/rules/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid rule ID' });
  }

  try {
    const validatedData = updateConfigRulesSchema.parse(req.body);

    const updatedRule = await prisma.config_rules.update({
      where: { id },
      data: validatedData,
    });

    res.json(updatedRule);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedDetails = formatValidationErrors(
        error,
        configRulesFieldMeta,
      );

      return res.status(400).json({
        error: 'Validation failed',
        details: formattedDetails,
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Rule not found' });
    }
    console.error(error);

    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/rules/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.config_rules.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
