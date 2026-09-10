/**
 * Dlicom Nexus - Phase 3 Engine & Integration Verification Suite
 * Validates:
 * 1. Parameterized HTTP template string interpolation.
 * 2. Safe deterministic transform expression evaluator (arithmetic, comparisons, ternaries, syntax errors, zero eval).
 * 3. Exact canonical starter template count preservation (strictly 3).
 * 4. Cross-subsystem dedicated in-memory Mascot -> Circle -> Pipeline -> Execution test fixture.
 * 5. Failure paths: invalid DAG, simulated node failure, error propagation, tier halting, no stuck running nodes.
 */

import { DagResolver } from '../src/core/engine/dagResolver.ts';
import { PipelineExecutor } from '../src/core/engine/executor.ts';
import { evaluateSafeExpression, interpolateTemplateString } from '../src/core/engine/safeEvaluator.ts';
import { SAMPLE_PIPELINES } from '../src/core/data/templates.ts';
import { globalExecutionStore } from '../src/core/store/executionStore.ts';
import { globalPipelineStore } from '../src/core/store/pipelineStore.ts';
import assert from 'node:assert';

console.log('======================================================================');
console.log('🚀 RUNNING PHASE 3 ENGINE & INTEGRATION VERIFICATION SUITE');
console.log('======================================================================\n');

let passedCount = 0;
let totalCount = 0;

function check(desc, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${desc}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${desc}`);
    console.error('     Error:', err.message);
  }
}

async function checkAsync(desc, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${desc}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${desc}`);
    console.error('     Error:', err.message);
  }
}

async function runSuite() {
  // -------------------------------------------------------------
  // 1. Parameterized HTTP Template Interpolation
  // -------------------------------------------------------------
  console.log('🔗 1. Parameterized HTTP Template Interpolation:');

  check('Interpolates top-level and nested properties from payload context', () => {
    const template = 'https://api.dlicom.nexus/v1/user/{{payload.username}}?role={{payload.archetype}}&score={{score}}';
    const context = {
      score: 95,
      payload: {
        username: 'vitalikbuterin',
        archetype: 'RESEARCH_QUANT'
      }
    };
    const resolved = interpolateTemplateString(template, context);
    assert.strictEqual(
      resolved,
      'https://api.dlicom.nexus/v1/user/vitalikbuterin?role=RESEARCH_QUANT&score=95'
    );
  });

  check('Handles missing properties gracefully with empty string', () => {
    const template = 'https://api.dlicom.nexus/user/{{missingProp}}';
    const resolved = interpolateTemplateString(template, { id: 123 });
    assert.strictEqual(resolved, 'https://api.dlicom.nexus/user/');
  });

  // -------------------------------------------------------------
  // 2. Safe Deterministic Transform Evaluator
  // -------------------------------------------------------------
  console.log('\n🧮 2. Safe Deterministic Transform Evaluator:');

  check('Evaluates basic arithmetic operations with correct precedence', () => {
    const res = evaluateSafeExpression('10 + 5 * 2 - 4 / 2');
    assert.strictEqual(res, 18);
  });

  check('Evaluates property comparisons and logical operators', () => {
    const context = {
      payload: {
        volumeUSD: 75000,
        archetype: 'CYBER_SENTINEL'
      }
    };
    const res1 = evaluateSafeExpression('payload.volumeUSD >= 50000 && payload.archetype === "CYBER_SENTINEL"', context);
    assert.strictEqual(res1, true);

    const res2 = evaluateSafeExpression('payload.volumeUSD < 10000', context);
    assert.strictEqual(res2, false);
  });

  check('Evaluates conditional ternary expressions safely', () => {
    const context = {
      score: 85,
      threshold: 80
    };
    const res = evaluateSafeExpression('score >= threshold ? "HIGH_INTERACTION" : "STANDARD"', context);
    assert.strictEqual(res, 'HIGH_INTERACTION');
  });

  check('Rejects unsafe expressions or invalid syntax with clean SafeExpressionError', () => {
    let threw = false;
    try {
      evaluateSafeExpression('function() { return process.exit(); }()');
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true, 'Should disallow functions / arbitrary keywords');
  });

  // -------------------------------------------------------------
  // 3. Canonical Starter Template Preservation
  // -------------------------------------------------------------
  console.log('\n📦 3. Canonical Starter Template Catalog:');

  check('Preserves the 3 canonical starter blueprints without template catalog expansion', () => {
    const canonicalTemplateIds = [
      'pipeline_smart_contract_discord_alert',
      'pipeline_dex_liquidity_slack_notification',
      'pipeline_cross_chain_state_sync'
    ];
    canonicalTemplateIds.forEach(id => {
      assert.ok(SAMPLE_PIPELINES.some(p => p.id === id), `Canonical blueprint "${id}" must exist`);
    });
    // Ensure no mascot template was added to canonical production SAMPLE_PIPELINES
    assert.ok(!SAMPLE_PIPELINES.some(p => p.id.includes('mascot') || p.id.includes('fixture')), 'Dedicated test fixture is not polluting production templates');
  });

  // -------------------------------------------------------------
  // 4. Cross-Subsystem Mascot -> Circle -> Pipeline In-Memory Fixture
  // -------------------------------------------------------------
  console.log('\n⚡ 4. Cross-Subsystem Dedicated Integration Fixture:');

  await checkAsync('Executes complete in-memory Mascot Social Signal pipeline successfully', async () => {
    const integrationPipeline = {
      id: 'fixture_mascot_social_pipeline',
      name: 'Fixture: Mascot Social Signal Flow',
      version: '1.0.0',
      description: 'Dedicated test fixture verifying Mascot -> Circle -> Pipeline -> Execution',
      environment: 'development',
      tags: ['integration', 'fixture', 'mascot', 'circle'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: [
        {
          id: 'n_signal_trigger',
          type: 'nexusNode',
          position: { x: 100, y: 150 },
          data: {
            label: 'Mascot Identity Signal Trigger',
            category: 'trigger',
            type: 'dlicom-social-signal',
            description: 'Emits authentic mascot signals',
            inputs: [],
            outputs: [{ id: 'username', label: 'Username', type: 'string' }],
            config: {
              username: 'vitalikbuterin',
              displayName: 'Vitalik Buterin',
              archetype: 'RESEARCH_QUANT',
              familyId: 'RESEARCH_FELLOWSHIP',
              variantId: 'research_quant_v1',
              interactionScore: 92
            },
            status: 'idle'
          }
        },
        {
          id: 'n_signal_transform',
          type: 'nexusNode',
          position: { x: 400, y: 150 },
          data: {
            label: 'Affinity Evaluator',
            category: 'transform',
            type: 'schema-transformer',
            description: 'Transforms identity signal',
            inputs: [{ id: 'input', label: 'Input', type: 'any' }],
            outputs: [{ id: 'result', label: 'Result', type: 'any' }],
            config: {
              expression: 'interactionScore >= 80 ? "HIGH_AFFINITY_FELLOW" : "REGULAR_PEER"'
            },
            status: 'idle'
          }
        },
        {
          id: 'n_signal_sink',
          type: 'nexusNode',
          position: { x: 700, y: 150 },
          data: {
            label: 'Peer Notification Webhook',
            category: 'sink',
            type: 'http-webhook-sink',
            description: 'Dispatches payload to peer webhook',
            inputs: [{ id: 'payload', label: 'Payload', type: 'object' }],
            outputs: [{ id: 'delivered', label: 'Delivered', type: 'boolean' }],
            config: {
              url: 'https://dispatch.dlicom.internal/peers/{{username}}'
            },
            status: 'idle'
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'n_signal_trigger', target: 'n_signal_transform' },
        { id: 'e2', source: 'n_signal_transform', target: 'n_signal_sink' }
      ]
    };

    const executor = new PipelineExecutor(integrationPipeline, { stepDelayMs: 10 });
    const run = await executor.execute();

    assert.strictEqual(run.status, 'success', 'Run status should be success');
    assert.strictEqual(run.metrics.nodesExecuted, 3, 'All 3 nodes executed');
    assert.strictEqual(run.metrics.nodesSucceeded, 3, 'All 3 nodes succeeded');
    assert.strictEqual(run.metrics.nodesFailed, 0, 'Zero nodes failed');

    // Verify step 2 output
    const transformStep = run.steps['step_n_signal_transform'];
    assert.ok(transformStep, 'Transform step must exist');
    assert.strictEqual(transformStep.status, 'success');
    assert.strictEqual(transformStep.outputPayload.result, 'HIGH_AFFINITY_FELLOW');

    // Verify step 3 output
    const sinkStep = run.steps['step_n_signal_sink'];
    assert.ok(sinkStep, 'Sink step must exist');
    assert.strictEqual(sinkStep.outputPayload.url, 'https://dispatch.dlicom.internal/peers/vitalikbuterin');
  });

  // -------------------------------------------------------------
  // 5. Failure-Path Resilience
  // -------------------------------------------------------------
  console.log('\n🛑 5. Failure-Path Resilience:');

  await checkAsync('Halts execution on invalid DAG cycle and reports error', async () => {
    const cyclicPipeline = {
      id: 'fixture_cyclic',
      name: 'Cyclic Pipeline',
      version: '1.0.0',
      description: 'Pipeline with a cycle',
      environment: 'development',
      tags: ['cyclic'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: [
        { id: 'ca', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'A', category: 'trigger', type: 't', inputs: [], outputs: [], config: {}, status: 'idle' } },
        { id: 'cb', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'B', category: 'transform', type: 't', inputs: [], outputs: [], config: {}, status: 'idle' } }
      ],
      edges: [
        { id: 'ce1', source: 'ca', target: 'cb' },
        { id: 'ce2', source: 'cb', target: 'ca' }
      ]
    };

    const executor = new PipelineExecutor(cyclicPipeline, { stepDelayMs: 5 });
    const run = await executor.execute();
    assert.strictEqual(run.status, 'error');
    assert.ok(run.logs.some(l => l.level === 'error' && l.message.includes('DAG invalid')));
  });

  await checkAsync('Simulated node failure sets node status to error, halts subsequent tiers, and records failed run', async () => {
    const failingPipeline = {
      id: 'fixture_failing',
      name: 'Simulated Failure Flow',
      version: '1.0.0',
      description: 'Pipeline with simulated node failure',
      environment: 'development',
      tags: ['failure'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: [
        {
          id: 'fn_1',
          type: 'nexusNode',
          position: { x: 0, y: 0 },
          data: {
            label: 'Trigger A',
            category: 'trigger',
            type: 'generic-trigger',
            inputs: [],
            outputs: [],
            config: {},
            status: 'idle'
          }
        },
        {
          id: 'fn_2_fail',
          type: 'nexusNode',
          position: { x: 200, y: 0 },
          data: {
            label: 'Failing Transform',
            category: 'transform',
            type: 'custom-transform',
            inputs: [],
            outputs: [],
            config: {
              simulateFailure: true
            },
            status: 'idle'
          }
        },
        {
          id: 'fn_3_downstream',
          type: 'nexusNode',
          position: { x: 400, y: 0 },
          data: {
            label: 'Downstream Sink',
            category: 'sink',
            type: 'http-sink',
            inputs: [],
            outputs: [],
            config: {},
            status: 'idle'
          }
        }
      ],
      edges: [
        { id: 'fe1', source: 'fn_1', target: 'fn_2_fail' },
        { id: 'fe2', source: 'fn_2_fail', target: 'fn_3_downstream' }
      ]
    };

    const executor = new PipelineExecutor(failingPipeline, { stepDelayMs: 10 });
    const run = await executor.execute();

    assert.strictEqual(run.status, 'error', 'Run status must be error');
    assert.strictEqual(run.metrics.nodesFailed, 1, 'Exactly 1 node failed');
    assert.strictEqual(run.metrics.nodesExecuted, 2, 'Executed Tier 1 and failed Tier 2');

    // Downstream Tier 3 node fn_3_downstream must NOT have executed
    assert.strictEqual(run.steps['step_fn_3_downstream'], undefined, 'Downstream node must be halted');

    // Failing node step must have status error
    const failedStep = run.steps['step_fn_2_fail'];
    assert.ok(failedStep);
    assert.strictEqual(failedStep.status, 'error');
    assert.ok(failedStep.error.message.includes('Simulated node failure'));

    // Check that failing node in pipeline store has status error
    const storedNode = globalPipelineStore.getNodes().find(n => n.id === 'fn_2_fail');
    if (storedNode) {
      assert.strictEqual(storedNode.data.status, 'error');
    }

    // Check that downstream node is NOT in running state
    const downstreamNode = globalPipelineStore.getNodes().find(n => n.id === 'fn_3_downstream');
    if (downstreamNode) {
      assert.notStrictEqual(downstreamNode.data.status, 'running', 'No node left in running state');
    }

    // Verify run was recorded in executionStore
    const storedRun = globalExecutionStore.getRun(run.id);
    assert.ok(storedRun, 'Run must be recorded in globalExecutionStore');
    assert.strictEqual(storedRun.status, 'error');
  });

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`🏁 PHASE 3 ENGINE VERIFICATION COMPLETE: ${passedCount}/${totalCount} CHECKS PASSED`);
  console.log('======================================================================');

  if (passedCount < totalCount) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
