#!/usr/bin/env bun
/**
 * Postbird AI Evaluation Runner
 *
 * Runs sample database prompts across discovered or specified local/cloud AI CLIs
 * and reports streaming latency, token metrics, and SQL output validity.
 *
 * Usage:
 *   bun scripts/evaluate_ai.ts
 *   bun scripts/evaluate_ai.ts --provider=agy
 *   bun scripts/evaluate_ai.ts --provider=claude --model=sonnet
 *   bun scripts/evaluate_ai.ts --provider=fm
 */

import { createAIConnector, discoverProviders } from '../lib/local_ai';
import { AILogger } from '../lib/local_ai/logger';

interface EvaluationCase {
  id: string;
  title: string;
  schema?: string;
  userPrompt: string;
  expectedSqlKeywords: string[];
}

const EVALUATION_SUITE: EvaluationCase[] = [
  {
    id: 'server-time',
    title: '1. Basic System Query (Server Time & Version)',
    userPrompt: "How do I check the PostgreSQL server's current timestamp and version?",
    expectedSqlKeywords: ['SELECT', 'NOW()'],
  },
  {
    id: 'query-builder-joins',
    title: '2. Schema-Aware Query Builder (Aggregates & Joins)',
    schema: `
Table public.customers (
  id integer PRIMARY KEY,
  name varchar(255),
  created_at timestamptz
)
Table public.orders (
  id integer PRIMARY KEY,
  customer_id integer REFERENCES customers(id),
  total_amount numeric(10,2),
  status varchar(50),
  ordered_at timestamptz
)
Table public.order_items (
  id integer PRIMARY KEY,
  order_id integer REFERENCES orders(id),
  product_id integer,
  quantity integer,
  price numeric(10,2)
)
`,
    userPrompt: 'Write a PostgreSQL query to find top 5 customers by total spending on completed orders in the last 30 days.',
    expectedSqlKeywords: ['SELECT', 'JOIN', 'GROUP BY', 'SUM', 'LIMIT'],
  },
  {
    id: 'index-recommendation',
    title: '3. Performance / Index Recommendation',
    schema: `
Table public.events (
  id bigserial PRIMARY KEY,
  tenant_id integer NOT NULL,
  event_type varchar(64) NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL
)
`,
    userPrompt: 'We frequently run: SELECT * FROM events WHERE tenant_id = 42 AND created_at >= NOW() - INTERVAL \'7 days\' ORDER BY created_at DESC; What index should we create?',
    expectedSqlKeywords: ['CREATE', 'INDEX', 'tenant_id', 'created_at'],
  },
];

async function main() {
  console.log('\n======================================================');
  console.log('         POSTBIRD AI CLI EVALUATION HARNESS           ');
  console.log('======================================================\n');

  const args = process.argv.slice(2);
  const targetProviderArg = args.find(a => a.startsWith('--provider='))?.split('=')[1];
  const targetModelArg = args.find(a => a.startsWith('--model='))?.split('=')[1];

  console.log('Discovering available AI providers on this machine...\n');
  const providers = await discoverProviders();

  if (providers.length === 0) {
    console.error('❌ No AI providers detected. Please install agy, claude, fm, or start Ollama/Groq.');
    process.exit(1);
  }

  console.log('Detected Providers:');
  for (const p of providers) {
    const mark = p.status === 'ready' ? '✓ READY' : `⚠ ${p.status.toUpperCase()}`;
    console.log(`  [${p.id.padEnd(14)}] ${p.name.padEnd(32)} ${mark} (${p.path || p.baseUrl || 'local'})`);
  }
  console.log('');

  const targetProviders = targetProviderArg
    ? providers.filter(p => p.id === targetProviderArg)
    : providers.filter(p => p.status === 'ready');

  if (targetProviders.length === 0) {
    console.error(`❌ Provider "${targetProviderArg}" not found or not ready.`);
    process.exit(1);
  }

  const router = createAIConnector();

  for (const provider of targetProviders) {
    console.log(`\n------------------------------------------------------`);
    console.log(`Evaluating Provider: ${provider.name} (ID: ${provider.id})`);
    console.log(`------------------------------------------------------`);

    for (const testCase of EVALUATION_SUITE) {
      console.log(`\n▶ ${testCase.title}`);
      if (testCase.schema) {
        console.log(`  Schema provided: ${testCase.schema.trim().split('\n')[0]} ...`);
      }
      console.log(`  Prompt: "${testCase.userPrompt}"`);

      const messages: any[] = [
        {
          role: 'system',
          content: 'You are an expert PostgreSQL DBA and SQL assistant embedded in Postbird.\nOutput valid PostgreSQL syntax enclosed in ```sql ... ``` code blocks.',
        },
      ];

      if (testCase.schema) {
        messages.push({
          role: 'user',
          content: `Database Schema:\n${testCase.schema}\n\nTask: ${testCase.userPrompt}`,
        });
      } else {
        messages.push({
          role: 'user',
          content: testCase.userPrompt,
        });
      }

      const start = Date.now();
      let streamedTokens = 0;
      let firstTokenTime: number | null = null;
      let fullResponse = '';

      try {
        process.stdout.write('  Stream: ');
        fullResponse = await router.chatStream(
          messages,
          {
            provider: provider.id,
            model: targetModelArg || provider.defaultModel,
          },
          (chunk: string) => {
            if (firstTokenTime === null) {
              firstTokenTime = Date.now() - start;
            }
            streamedTokens++;
            // Print dots or first characters for visual progress
            process.stdout.write(chunk.replace(/\n/g, ' '));
          }
        );
        process.stdout.write('\n');

        const totalTime = Date.now() - start;
        console.log(`  ✓ TTFT (Time-to-First-Token): ${firstTokenTime ?? totalTime}ms | Total Time: ${totalTime}ms | Chunks: ${streamedTokens}`);

        // Check for expected SQL keywords
        const upper = fullResponse.toUpperCase();
        const matches = testCase.expectedSqlKeywords.filter(k => upper.includes(k.toUpperCase()));
        const passedKeywords = matches.length === testCase.expectedSqlKeywords.length;

        if (passedKeywords) {
          console.log(`  ✓ SQL Keyword Validation Passed (${matches.join(', ')})`);
        } else {
          console.log(`  ⚠ Missing some expected SQL keywords. Found: [${matches.join(', ')}], Expected: [${testCase.expectedSqlKeywords.join(', ')}]`);
        }
      } catch (err: any) {
        process.stdout.write('\n');
        console.error(`  ❌ Failed: ${err.message || String(err)}`);
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`Evaluation complete! Detailed logs saved to: ${AILogger.getLogFilePath()}`);
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error('Fatal evaluation runner error:', err);
  process.exit(1);
});
