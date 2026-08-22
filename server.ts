import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { SCENARIOS } from './src/data/scenarios';
import { AgentOrchestrator } from './server/gemini';
import { SandboxEngine } from './server/sandbox';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Swarm Defense 2026 Simulation Server',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString()
    });
  });

  // Get available target scenarios
  app.get('/api/scenarios', (req, res) => {
    res.json({
      success: true,
      scenarios: SCENARIOS
    });
  });

  // Phase 1: Red Agent Attack payload synthesis & execution
  app.post('/api/simulate/red', async (req, res) => {
    try {
      const { scenarioId, strategy = 'apt', temperature = 0.7 } = req.body;
      const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

      const attackResult = await AgentOrchestrator.generateRedAttack(scenario, strategy, temperature);
      res.json({ success: true, redResult: attackResult });
    } catch (err) {
      console.error('[API_ERROR /api/simulate/red]', err);
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Phase 2: Blue Agent Defense patch synthesis
  app.post('/api/simulate/blue', async (req, res) => {
    try {
      const { scenarioId, logs = [], currentCode, strategy = 'logic_refactor', temperature = 0.5 } = req.body;
      const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
      const sourceCode = currentCode || scenario.vulnerableCode;

      const defenseResult = await AgentOrchestrator.generateBlueDefense(
        scenario,
        logs,
        sourceCode,
        strategy,
        temperature
      );
      res.json({ success: true, blueResult: defenseResult });
    } catch (err) {
      console.error('[API_ERROR /api/simulate/blue]', err);
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Phase 3: Arbiter Evaluation
  app.post('/api/simulate/arbiter', async (req, res) => {
    try {
      const { scenarioId, redResult, blueResult } = req.body;
      const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

      if (!redResult || !blueResult) {
        return res.status(400).json({ success: false, error: 'Both redResult and blueResult are required' });
      }

      const arbiterResult = AgentOrchestrator.evaluateArbiter(scenario, redResult, blueResult);
      res.json({ success: true, arbiterResult });
    } catch (err) {
      console.error('[API_ERROR /api/simulate/arbiter]', err);
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Execute full automated round
  app.post('/api/simulate/full-round', async (req, res) => {
    try {
      const { scenarioId, redStrategy = 'apt', blueStrategy = 'logic_refactor', redTemp = 0.7, blueTemp = 0.5 } = req.body;
      const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

      const start = Date.now();
      const redResult = await AgentOrchestrator.generateRedAttack(scenario, redStrategy, redTemp);
      const blueResult = await AgentOrchestrator.generateBlueDefense(
        scenario,
        redResult.executionLogs,
        scenario.vulnerableCode,
        blueStrategy,
        blueTemp
      );
      const arbiterResult = AgentOrchestrator.evaluateArbiter(scenario, redResult, blueResult);

      res.json({
        success: true,
        round: {
          scenario,
          redResult,
          blueResult,
          arbiterResult,
          durationMs: Date.now() - start,
          timestamp: Date.now()
        }
      });
    } catch (err) {
      console.error('[API_ERROR /api/simulate/full-round]', err);
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // INTERACTIVE DRILL: Execute custom user-crafted Red Attack
  app.post('/api/interactive/execute-red', async (req, res) => {
    try {
      const { scenarioId, payload, actionName = 'Custom Exploit', rationale = '', vectorName = 'Manual Vector' } = req.body;
      const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

      const httpPayload = payload || scenario.defaultExploit;
      const execution = SandboxEngine.executeAttack(scenario, httpPayload, false);

      const redResult = {
        flawIdentified: scenario.vulnerabilityType,
        attackVector: vectorName || `${httpPayload.method} ${httpPayload.path}`,
        payload: httpPayload,
        rationale: rationale || `Operator manually dispatched custom payload targeting ${scenario.apiDoc.endpoint}`,
        cveTag: scenario.cweId,
        executionLogs: [
          {
            timestamp: new Date().toISOString(),
            level: 'info' as const,
            source: 'OPERATOR' as const,
            message: `[OPERATOR_ATTACK] User launched attack: ${actionName} (${httpPayload.method} ${httpPayload.path})`
          },
          ...execution.logs
        ],
        success: execution.success,
        statusCode: execution.statusCode,
        responseBody: execution.responseBody,
        exfiltratedData: execution.exfiltration,
        executedAt: Date.now(),
        modelUsed: 'Operator Interactive Command',
        isUserInitiated: true
      };

      // Construct operator debrief explaining choice & result
      const debrief = {
        id: `debrief-red-${Date.now()}`,
        timestamp: Date.now(),
        role: 'red_attacker' as const,
        scenario,
        actionName,
        actionCategory: 'OFFENSE' as const,
        choiceSummary: `Selected ${actionName} targeting ${scenario.targetService} (${httpPayload.method} ${httpPayload.path})`,
        technicalRationale: scenario.attackMechanics?.[0] || scenario.description,
        outcomeStatus: execution.success ? ('BREACH_SUCCESS' as const) : ('BREACH_BLOCKED' as const),
        statusCode: execution.statusCode,
        exfiltratedData: execution.exfiltration,
        mitreMapping: {
          attackId: scenario.mitreAttack?.techniqueId,
          attackName: scenario.mitreAttack?.techniqueName,
          owaspCode: scenario.owasp?.code,
          owaspTitle: scenario.owasp?.title
        },
        stepByStepBreakdown: [
          `1. Dispatched HTTP ${httpPayload.method} request to microservice endpoint "${httpPayload.path}".`,
          `2. Request evaluated by sandbox container. HTTP status code returned: ${execution.statusCode}.`,
          execution.success
            ? `3. SECURITY BREACH CONFIRMED: Target endpoint succumbed to ${scenario.cweId}. Unauthorized data returned in response payload.`
            : `3. ATTACK BLOCKED / INCOMPLETE: Target endpoint returned HTTP ${execution.statusCode}. The exploit condition was not triggered.`
        ],
        keyTakeaway: execution.success
          ? `Your payload triggered the underlying vulnerability (${scenario.vulnerabilityType}). In real production, this exposes sensitive tenant records or gives remote execution.`
          : `The payload did not bypass endpoint checks. Try inspecting the route specification, header format, or injecting unescaped metacharacters.`,
        proSecurityTip: `Offensive red-teaming in 2026 relies on weaponizing business logic discrepancies, deserialization flaws, and indirect prompt jailbreaks that evade legacy WAF regex.`
      };

      res.json({
        success: true,
        redResult,
        debrief
      });
    } catch (err) {
      console.error('[API_ERROR /api/interactive/execute-red]', err);
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // INTERACTIVE DRILL: Deploy custom user-crafted Blue Defense Hot-Patch
  app.post('/api/interactive/execute-blue', async (req, res) => {
    try {
      const { scenarioId, patchedCode, strategy = 'logic_refactor', strategyName = 'Custom Shield', rationale = '' } = req.body;
      const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
      const codeToApply = patchedCode || scenario.defaultPatch.patchedCode;

      const diff = SandboxEngine.computeDiff(scenario.vulnerableCode, codeToApply, scenario.targetFile);

      const patchLogs = [
        {
          timestamp: new Date().toISOString(),
          level: 'patch' as const,
          source: 'OPERATOR' as const,
          message: `[OPERATOR_DEFENSE] Operator deployed hotfix: ${strategyName} (+${diff.additions} / -${diff.deletions} lines)`
        },
        {
          timestamp: new Date().toISOString(),
          level: 'success' as const,
          source: 'BLUE' as const,
          message: `[HOTPATCH_DEPLOYED] Zero-downtime hot-patch applied live to isolated container context.`
        }
      ];

      const blueResult = {
        identifiedSignature: `Operator targeted flaw in ${scenario.targetFile} using ${strategyName}`,
        attackAnalysis: `Remediation applied to mitigate ${scenario.vulnerabilityType}. Guardrail enforces validation before business logic execution.`,
        patchStrategy: strategyName,
        unifiedDiff: diff.unifiedDiff,
        patchedCode: codeToApply,
        rationale: rationale || `Operator hot-patch deployed to eliminate ${scenario.cweId} with zero service downtime.`,
        diffStats: {
          additions: diff.additions,
          deletions: diff.deletions,
          filesChanged: 1
        },
        executionLogs: patchLogs,
        generatedAt: Date.now(),
        modelUsed: 'Operator Interactive Patch Studio',
        isUserInitiated: true
      };

      const debrief = {
        id: `debrief-blue-${Date.now()}`,
        timestamp: Date.now(),
        role: 'blue_defender' as const,
        scenario,
        actionName: strategyName,
        actionCategory: 'DEFENSE' as const,
        choiceSummary: `Applied defensive patch using ${strategyName} (+${diff.additions}/-${diff.deletions} lines changed)`,
        technicalRationale: scenario.defenseMechanics?.[0] || scenario.defaultPatch.rationale,
        outcomeStatus: 'PATCH_EFFECTIVE' as const,
        diffStats: { additions: diff.additions, deletions: diff.deletions },
        mitreMapping: {
          d3fendId: scenario.mitreDefend?.d3fendId,
          d3fendName: scenario.mitreDefend?.d3fendName,
          owaspCode: scenario.owasp?.code,
          owaspTitle: scenario.owasp?.title
        },
        stepByStepBreakdown: [
          `1. Replaced vulnerable code block with hardened logic in "${scenario.targetFile}".`,
          `2. Generated unified diff: ${diff.additions} lines added, ${diff.deletions} lines modified.`,
          `3. Hot-patch dynamically staged in runtime VM. Ready for Arbiter regression suite and SLA check.`
        ],
        keyTakeaway: `Defensive hot-patching requires balancing security hardening with backward compatibility so legitimate user traffic never experiences 500 errors.`,
        proSecurityTip: `Adopting D3FEND patterns like ${scenario.mitreDefend?.d3fendName || 'Input Validation'} at the application layer eliminates systemic vulnerabilities across the microservice mesh.`
      };

      res.json({
        success: true,
        blueResult,
        debrief
      });
    } catch (err) {
      console.error('[API_ERROR /api/interactive/execute-blue]', err);
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // INTERACTIVE DRILL: Arbiter Dual-Verification Suite
  app.post('/api/interactive/evaluate-arbiter', async (req, res) => {
    try {
      const { scenarioId, attackPayload, patchedCode } = req.body;
      const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
      const payload = attackPayload || scenario.defaultExploit;
      const code = patchedCode || scenario.defaultPatch.patchedCode;

      const arbiterResult = SandboxEngine.evaluatePatch(scenario, payload, code);
      arbiterResult.isUserInitiated = true;

      const debrief = {
        id: `debrief-arbiter-${Date.now()}`,
        timestamp: Date.now(),
        role: 'arbiter_judge' as const,
        scenario,
        actionName: 'Dual Verification Suite',
        actionCategory: 'EVALUATION' as const,
        choiceSummary: `Evaluated threat neutralization & tested ${scenario.normalTrafficSamples.length} production traffic samples`,
        technicalRationale: `The Arbiter executes dual validation: 1) Verifying the offensive payload is rejected, and 2) Verifying all normal client API calls succeed with zero regressions.`,
        outcomeStatus: 'VERDICT_RENDERED' as const,
        statusCode: arbiterResult.exploitReTest.statusCode,
        stepByStepBreakdown: [
          `1. Exploit Re-Test: Fired attack payload against patched container. Status: HTTP ${arbiterResult.exploitReTest.statusCode} (${arbiterResult.exploitNeutralized ? 'BLOCKED' : 'FAILED - EXPLOIT PASSED'}).`,
          `2. Regression Suite: Tested ${arbiterResult.normalTrafficResults.length} legitimate traffic integration contracts. Passed: ${arbiterResult.uptimeCheckPassed ? '100% (Zero Downtime SLA Met)' : 'FAILED (Production Outage Triggered)'}.`,
          `3. Final Ruling: ${arbiterResult.verdictTitle}. Resilience Score computed at ${arbiterResult.resilienceScore}%.`
        ],
        keyTakeaway: arbiterResult.verdict === 'BLUE_WIN'
          ? `Perfect Defense! The threat vector was eliminated while 100% of customer traffic continues uninterrupted.`
          : arbiterResult.verdict === 'PATCH_BROKE_PROD'
          ? `The patch was overly aggressive or introduced a syntax flaw that broke legitimate user traffic, violating the microservice SLA.`
          : `The exploit succeeded because the hot-patch did not address the root vulnerability mechanism.`,
        proSecurityTip: `Continuous synthetic red-teaming in CI/CD ensures patches are tested against both exploit variants and legitimate regression baselines before deployment.`
      };

      res.json({
        success: true,
        arbiterResult,
        debrief
      });
    } catch (err) {
      console.error('[API_ERROR /api/interactive/evaluate-arbiter]', err);
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // INTERACTIVE DRILL: AI Co-Pilot Advice & Tactical Guidance
  app.post('/api/interactive/copilot', async (req, res) => {
    try {
      const { role = 'red', scenarioId, payload, patchedCode, question } = req.body;
      const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

      const copilot = await AgentOrchestrator.generateCopilotAdvice(
        role,
        scenario,
        { payload, patchedCode, question }
      );

      res.json({
        success: true,
        copilot
      });
    } catch (err) {
      console.error('[API_ERROR /api/interactive/copilot]', err);
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });


  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Swarm Defense 2026 server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
