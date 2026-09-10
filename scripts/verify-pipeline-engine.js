/**
 * Dlicom Nexus - Automated Pipeline Engine & Architecture Verification Suite
 * Validates DAG resolution, cycle detection, starter templates, execution cascades,
 * JSON export/import persistence, and unified shell route mapping.
 */

import { DagResolver } from '../src/core/engine/dagResolver.ts';
import { PipelineExecutor } from '../src/core/engine/executor.ts';
import { SAMPLE_PIPELINES } from '../src/core/data/templates.ts';
import { PipelineStore } from '../src/core/store/pipelineStore.ts';
import assert from 'node:assert';

console.log('======================================================================');
console.log('🚀 RUNNING DLICOM NEXUS PIPELINE ENGINE VERIFICATION SUITE');
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
  // 1. DAG Resolution & Topological Sort
  // -------------------------------------------------------------
  console.log('📐 1. DAG Resolution & Topological Sort:');

  check('Correctly organizes linear nodes into sequential tiers', () => {
    const nodes = [
      { id: 'n1', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'Node 1', category: 'trigger', type: 't', inputs: [], outputs: [], config: {} } },
      { id: 'n2', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'Node 2', category: 'transform', type: 't', inputs: [], outputs: [], config: {} } },
      { id: 'n3', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'Node 3', category: 'sink', type: 's', inputs: [], outputs: [], config: {} } }
    ];
    const edges = [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' }
    ];
    const res = DagResolver.resolve(nodes, edges);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.hasCycles, false);
    assert.strictEqual(res.executionTiers.length, 3);
    assert.deepStrictEqual(res.executionTiers[0], ['n1']);
    assert.deepStrictEqual(res.executionTiers[1], ['n2']);
    assert.deepStrictEqual(res.executionTiers[2], ['n3']);
    assert.deepStrictEqual(res.rootNodeIds, ['n1']);
    assert.deepStrictEqual(res.leafNodeIds, ['n3']);
  });

  check('Correctly organizes branching diamond nodes into parallel tiers', () => {
    const nodes = [
      { id: 'root', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'Root', category: 'trigger', type: 't', inputs: [], outputs: [], config: {} } },
      { id: 'branchA', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'Branch A', category: 'ai', type: 'a', inputs: [], outputs: [], config: {} } },
      { id: 'branchB', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'Branch B', category: 'connector', type: 'c', inputs: [], outputs: [], config: {} } },
      { id: 'join', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'Join', category: 'sink', type: 's', inputs: [], outputs: [], config: {} } }
    ];
    const edges = [
      { id: 'e1', source: 'root', target: 'branchA' },
      { id: 'e2', source: 'root', target: 'branchB' },
      { id: 'e3', source: 'branchA', target: 'join' },
      { id: 'e4', source: 'branchB', target: 'join' }
    ];
    const res = DagResolver.resolve(nodes, edges);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.executionTiers.length, 3);
    assert.deepStrictEqual(res.executionTiers[0], ['root']);
    assert.strictEqual(res.executionTiers[1].length, 2);
    assert.ok(res.executionTiers[1].includes('branchA') && res.executionTiers[1].includes('branchB'));
    assert.deepStrictEqual(res.executionTiers[2], ['join']);
  });

  // -------------------------------------------------------------
  // 2. Strict Cycle Detection
  // -------------------------------------------------------------
  console.log('\n🔄 2. Strict Cycle Detection:');

  check('Detects direct cyclic dependency (A -> B -> A)', () => {
    const nodes = [
      { id: 'nA', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'Node A', category: 'transform', type: 't', inputs: [], outputs: [], config: {} } },
      { id: 'nB', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'Node B', category: 'transform', type: 't', inputs: [], outputs: [], config: {} } }
    ];
    const edges = [
      { id: 'e1', source: 'nA', target: 'nB' },
      { id: 'e2', source: 'nB', target: 'nA' }
    ];
    const res = DagResolver.resolve(nodes, edges);
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.hasCycles, true);
    assert.ok(res.errors.length > 0);
  });

  check('Detects complex indirect cycle (A -> B -> C -> D -> B)', () => {
    const nodes = [
      { id: 'nA', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'A', category: 'trigger', type: 't', inputs: [], outputs: [], config: {} } },
      { id: 'nB', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'B', category: 'transform', type: 't', inputs: [], outputs: [], config: {} } },
      { id: 'nC', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'C', category: 'transform', type: 't', inputs: [], outputs: [], config: {} } },
      { id: 'nD', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'D', category: 'transform', type: 't', inputs: [], outputs: [], config: {} } }
    ];
    const edges = [
      { id: 'e1', source: 'nA', target: 'nB' },
      { id: 'e2', source: 'nB', target: 'nC' },
      { id: 'e3', source: 'nC', target: 'nD' },
      { id: 'e4', source: 'nD', target: 'nB' }
    ];
    const res = DagResolver.resolve(nodes, edges);
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.hasCycles, true);
  });

  // -------------------------------------------------------------
  // 3. Canonical Starter Templates Integrity
  // -------------------------------------------------------------
  console.log('\n📦 3. Canonical Starter Templates:');

  const templateIds = [
    'pipeline_smart_contract_discord_alert',
    'pipeline_dex_liquidity_slack_notification',
    'pipeline_cross_chain_state_sync'
  ];

  templateIds.forEach(id => {
    check(`Template "${id}" is defined with valid DAG structure`, () => {
      const t = SAMPLE_PIPELINES.find(p => p.id === id);
      assert.ok(t, `Template ${id} must exist in SAMPLE_PIPELINES`);
      assert.ok(t.nodes.length >= 3, 'Template must have at least 3 nodes');
      assert.ok(t.edges.length >= 2, 'Template must have at least 2 edges');
      const validation = DagResolver.resolve(t.nodes, t.edges);
      assert.strictEqual(validation.isValid, true, `Validation failed: ${validation.errors.join(', ')}`);
      assert.strictEqual(validation.hasCycles, false);
      assert.ok(validation.rootNodeIds.length >= 1, 'Must have root trigger');
      assert.ok(validation.leafNodeIds.length >= 1, 'Must have leaf sink');
    });
  });

  // -------------------------------------------------------------
  // 4. DAG Pipeline Execution Simulation
  // -------------------------------------------------------------
  console.log('\n⚡ 4. DAG Pipeline Execution Simulation:');

  await checkAsync('Executes Smart Contract → Discord Alert pipeline successfully', async () => {
    const t = SAMPLE_PIPELINES.find(p => p.id === 'pipeline_smart_contract_discord_alert');
    const executor = new PipelineExecutor(t, {
      stepDelayMs: 10,
      environment: 'production',
      initiatedBy: 'Test Runner',
      triggerPayload: {
        network: 'ethereum_mainnet',
        event: 'Transfer',
        rawAmount: '250000000000000000000',
        txHash: '0x81b7e419dc2749...'
      }
    });

    const run = await executor.execute();
    assert.strictEqual(run.status, 'success');
    assert.strictEqual(run.metrics.nodesExecuted, 3);
    assert.strictEqual(run.metrics.nodesSucceeded, 3);
    assert.strictEqual(run.metrics.nodesFailed, 0);
    assert.ok(run.logs.length >= 5, 'Must generate step and execution logs');
    assert.strictEqual(run.stepOrder.length, 3);
    const lastStep = run.steps[run.stepOrder[2]];
    assert.strictEqual(lastStep.status, 'success');
    assert.strictEqual(lastStep.outputPayload.delivered, true);
  });

  await checkAsync('Executes DEX Liquidity Sweep → Slack Notification pipeline successfully', async () => {
    const t = SAMPLE_PIPELINES.find(p => p.id === 'pipeline_dex_liquidity_slack_notification');
    const executor = new PipelineExecutor(t, {
      stepDelayMs: 10,
      environment: 'production',
      initiatedBy: 'Test Runner',
      triggerPayload: {
        volumeUSD: 120000,
        slippagePct: 2.1,
        pool: 'WETH-USDC-0.05%'
      }
    });

    const run = await executor.execute();
    assert.strictEqual(run.status, 'success');
    assert.strictEqual(run.metrics.nodesExecuted, 4);
    assert.strictEqual(run.metrics.nodesSucceeded, 4);
    assert.strictEqual(run.metrics.nodesFailed, 0);
    const filterStep = run.steps[run.stepOrder[2]];
    assert.strictEqual(filterStep.outputPayload.passed, true);
    assert.strictEqual(filterStep.outputPayload.volumeUSD, 120000);
  });

  await checkAsync('Executes Cross-Chain State Sync pipeline successfully', async () => {
    const t = SAMPLE_PIPELINES.find(p => p.id === 'pipeline_cross_chain_state_sync');
    const executor = new PipelineExecutor(t, {
      stepDelayMs: 10,
      environment: 'staging',
      initiatedBy: 'Test Runner'
    });

    const run = await executor.execute();
    assert.strictEqual(run.status, 'success');
    assert.strictEqual(run.metrics.nodesExecuted, 4);
    assert.strictEqual(run.metrics.nodesSucceeded, 4);
  });

  // -------------------------------------------------------------
  // 5. Store Persistence & JSON Export/Import
  // -------------------------------------------------------------
  console.log('\n💾 5. Store Persistence & JSON Export/Import:');

  check('PipelineStore initializes and exports valid JSON representation', () => {
    const store = new PipelineStore();
    const all = store.getAllPipelines();
    assert.ok(all.length >= 3, 'Must contain all starter templates');
    const jsonStr = store.exportPipelinesJson();
    assert.ok(jsonStr.length > 500);
    const parsed = JSON.parse(jsonStr);
    assert.ok(Array.isArray(parsed));
    assert.strictEqual(parsed.length, all.length);
  });

  check('PipelineStore imports new pipelines via importPipelinesJson', () => {
    const store = new PipelineStore();
    const customPipeline = {
      id: 'custom_test_pipeline_99',
      name: 'Custom Test Pipeline',
      description: 'Testing JSON import',
      version: '1.0.0',
      environment: 'development',
      tags: ['test'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Tester',
      nodes: [
        { id: 'c1', type: 'nexusNode', position: { x: 0, y: 0 }, data: { label: 'Start', category: 'trigger', type: 't', inputs: [], outputs: [], config: {} } }
      ],
      edges: [],
      variables: {},
      retryPolicy: { maxRetries: 1, backoffFactor: 1, initialIntervalMs: 100, maxIntervalMs: 1000 },
      concurrencyLimit: 5,
      timeoutSeconds: 10,
      active: true
    };

    const res = store.importPipelinesJson(JSON.stringify([customPipeline]));
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.count, 1);
    assert.ok(store.getPipelineById('custom_test_pipeline_99'));
  });

  console.log('\n======================================================================');
  console.log(`VERIFICATION SUMMARY: ${passedCount}/${totalCount} checks passed (${Math.round(passedCount / totalCount * 100)}%)`);
  console.log('======================================================================');

  if (passedCount === totalCount) {
    console.log('🎉 ALL DLICOM NEXUS PIPELINE ENGINE CHECKS PASSED!\n');
  } else {
    console.error('❌ SOME CHECKS FAILED!\n');
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal suite execution error:', err);
  process.exit(1);
});
