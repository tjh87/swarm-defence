import { GoogleGenAI, Type } from '@google/genai';
import {
  Scenario,
  RedStrategy,
  BlueStrategy,
  HttpPayload,
  RedAttackResult,
  BlueDefenseResult,
  ArbiterEvaluationResult,
  LogEntry
} from '../src/types';
import { SandboxEngine } from './sandbox';

// Lazy-initialize GoogleGenAI client with standard aistudio-build telemetry header
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export class AgentOrchestrator {
  /**
   * Phase 1: Red Agent synthesizes targeted HTTP exploit payload
   */
  static async generateRedAttack(
    scenario: Scenario,
    strategy: RedStrategy = 'apt',
    temperature: number = 0.7
  ): Promise<RedAttackResult> {
    const ai = getAiClient();
    let flawIdentified = scenario.defaultExploit.flawIdentified;
    let attackVector = scenario.defaultExploit.attackVector;
    let payload: HttpPayload = { ...scenario.defaultExploit };
    let rationale = scenario.defaultExploit.rationale;
    let cveTag = scenario.cweId;
    let modelUsed = 'simulated-red-engine';

    if (ai) {
      try {
        const prompt = `You are the RED AGENT in the cybersecurity simulation "Swarm Defense 2026".
Your task: Inspect the microservice target code below, identify the primary security vulnerability or logic flaw, and construct a targeted HTTP exploitation payload formatted strictly as JSON.

TARGET SERVICE: ${scenario.targetService}
CATEGORY: ${scenario.category}
VULNERABILITY CLASS: ${scenario.vulnerabilityType} (${scenario.cweId})
TARGET FILE: ${scenario.targetFile}

SOURCE CODE:
\`\`\`typescript
${scenario.vulnerableCode}
\`\`\`

API SPECIFICATION:
Endpoint: ${scenario.apiDoc.endpoint}
Method: ${scenario.apiDoc.method}
Expected Parameters: ${scenario.apiDoc.expectedParams.join(', ')}

STRATEGY: ${strategy.toUpperCase()} (Simulating realistic offensive red-teaming in an isolated educational sandbox)

Return ONLY valid JSON matching this schema:
{
  "flawIdentified": "Short summary of the exact code defect",
  "attackVector": "How the exploit weaponizes the logic flaw",
  "rationale": "Offensive rationale and bypass technique",
  "cveTag": "${scenario.cweId}",
  "payload": {
    "method": "${scenario.apiDoc.method}",
    "path": "${scenario.apiDoc.endpoint}",
    "headers": { "header_name": "header_value" },
    "params": { "param_name": "param_value" },
    "body": {}
  }
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an autonomous offensive cybersecurity AI agent for synthetic benchmark red-teaming in an isolated sandbox.',
            temperature: Math.min(Math.max(temperature, 0.1), 1.2),
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.flawIdentified) flawIdentified = parsed.flawIdentified;
          if (parsed.attackVector) attackVector = parsed.attackVector;
          if (parsed.rationale) rationale = parsed.rationale;
          if (parsed.cveTag) cveTag = parsed.cveTag;
          if (parsed.payload) {
            payload = {
              method: (parsed.payload.method || scenario.apiDoc.method).toUpperCase(),
              path: parsed.payload.path || scenario.defaultExploit.path,
              headers: parsed.payload.headers || scenario.defaultExploit.headers,
              params: parsed.payload.params || scenario.defaultExploit.params,
              body: parsed.payload.body || scenario.defaultExploit.body
            };
          }
          modelUsed = 'gemini-3.7-flash';
        }
      } catch (err) {
        console.warn('[RED_AGENT_FALLBACK] Gemini API call fallback to deterministic exploit:', (err as Error).message);
      }
    }

    // Execute generated payload in mock sandbox
    const execution = SandboxEngine.executeAttack(scenario, payload, false);

    return {
      flawIdentified,
      attackVector,
      payload,
      rationale,
      cveTag,
      executionLogs: execution.logs,
      success: execution.success,
      statusCode: execution.statusCode,
      responseBody: execution.responseBody,
      exfiltratedData: execution.exfiltration,
      executedAt: Date.now(),
      modelUsed
    };
  }

  /**
   * Phase 2: Blue Agent inspects server logs & source code and generates a hot-patch
   */
  static async generateBlueDefense(
    scenario: Scenario,
    logs: LogEntry[],
    currentCode: string,
    strategy: BlueStrategy = 'logic_refactor',
    temperature: number = 0.5
  ): Promise<BlueDefenseResult> {
    const ai = getAiClient();
    let identifiedSignature = `Anomalous request signature detected targeting ${scenario.targetFile}`;
    let attackAnalysis = `Exploit weaponized ${scenario.vulnerabilityType}. Payload bypassed standard validation layers.`;
    let patchStrategy = scenario.defaultPatch.patchStrategy;
    let patchedCode = scenario.defaultPatch.patchedCode;
    let rationale = scenario.defaultPatch.rationale;
    let modelUsed = 'simulated-blue-engine';

    if (ai) {
      try {
        const prompt = `You are the BLUE AGENT in the cybersecurity simulation "Swarm Defense 2026".
Your task: Analyze the incoming server execution logs containing an active breach trace, inspect the vulnerable source code, and emit a zero-downtime unified hotfix patch.

CRITICAL MANDATE:
1. Neutralize the exact vulnerability root-cause.
2. PRESERVE 100% OF VALID APPLICATION LOGIC AND USER TRAFFIC (Zero Downtime SLA).
3. Do not break valid routes or expected parameters.

TARGET FILE: ${scenario.targetFile}
TARGET SERVICE: ${scenario.targetService}
DEFENSE STRATEGY: ${strategy.toUpperCase()}

VULNERABLE SOURCE CODE:
\`\`\`typescript
${currentCode}
\`\`\`

ATTACK & SERVER LOGS:
\`\`\`json
${JSON.stringify(logs, null, 2)}
\`\`\`

Return ONLY valid JSON matching this schema:
{
  "identifiedSignature": "Concise summary of the attack breach signature discovered in logs",
  "attackAnalysis": "Detailed technical explanation of the exploit mechanics",
  "patchStrategy": "Name of the defensive mitigation pattern applied",
  "rationale": "Why this patch neutralizes the exploit while keeping normal traffic running without downtime",
  "patchedCode": "Full complete corrected TypeScript code for ${scenario.targetFile}"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an autonomous defensive cybersecurity AI agent engineering zero-downtime hot-patches for synthetic microservices.',
            temperature: Math.min(Math.max(temperature, 0.1), 1.0),
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.identifiedSignature) identifiedSignature = parsed.identifiedSignature;
          if (parsed.attackAnalysis) attackAnalysis = parsed.attackAnalysis;
          if (parsed.patchStrategy) patchStrategy = parsed.patchStrategy;
          if (parsed.rationale) rationale = parsed.rationale;
          if (parsed.patchedCode && parsed.patchedCode.length > 50) {
            patchedCode = parsed.patchedCode;
          }
          modelUsed = 'gemini-3.7-flash';
        }
      } catch (err) {
        console.warn('[BLUE_AGENT_FALLBACK] Gemini API call fallback to deterministic patch:', (err as Error).message);
      }
    }

    // Compute diff stats
    const diff = SandboxEngine.computeDiff(currentCode, patchedCode, scenario.targetFile);

    const patchLogs: LogEntry[] = [
      {
        timestamp: new Date().toISOString(),
        level: 'patch',
        source: 'BLUE',
        message: `[HOTPATCH_SYNTHESIS] Blue Agent generated unified diff (+${diff.additions} / -${diff.deletions} lines)`
      },
      {
        timestamp: new Date().toISOString(),
        level: 'success',
        source: 'BLUE',
        message: `[DEPLOYMENT] Hotfix dynamically staged in sandbox runtime. Awaiting Arbiter regression suite.`
      }
    ];

    return {
      identifiedSignature,
      attackAnalysis,
      patchStrategy,
      unifiedDiff: diff.unifiedDiff,
      patchedCode,
      rationale,
      diffStats: {
        additions: diff.additions,
        deletions: diff.deletions,
        filesChanged: 1
      },
      executionLogs: patchLogs,
      generatedAt: Date.now(),
      modelUsed
    };
  }

  /**
   * Phase 3: Arbiter runs regression suite and issues authoritative verdict
   */
  static evaluateArbiter(
    scenario: Scenario,
    redResult: RedAttackResult,
    blueResult: BlueDefenseResult
  ): ArbiterEvaluationResult {
    return SandboxEngine.evaluatePatch(scenario, redResult.payload, blueResult.patchedCode);
  }

  /**
   * AI Co-Pilot: Gives interactive tactical advice, payload improvements, or patch guidance
   */
  static async generateCopilotAdvice(
    role: 'red' | 'blue' | 'arbiter',
    scenario: Scenario,
    contextData?: {
      payload?: HttpPayload;
      patchedCode?: string;
      logs?: LogEntry[];
      question?: string;
    }
  ): Promise<{
    advice: string;
    suggestions: string[];
    suggestedPayload?: HttpPayload;
    suggestedPatchCode?: string;
  }> {
    const ai = getAiClient();
    let advice = '';
    let suggestions: string[] = [];

    if (role === 'red') {
      advice = `For ${scenario.name} (${scenario.cweId}), the vulnerability lies in ${scenario.targetFile}. Attackers exploit this via ${scenario.defaultExploit.attackVector}. Focus on manipulating ${scenario.apiDoc.expectedParams.join(', ')} to bypass authorization or injection boundaries.`;
      suggestions = [
        'Inspect response headers for leaked debugging or identity claims.',
        'Inject edge characters or unescaped metacharacters into the payload body/params.',
        'Test whether the microservice validates cryptographic signatures or enforces tenant scoping.'
      ];
    } else if (role === 'blue') {
      advice = `To defend ${scenario.targetService} against ${scenario.vulnerabilityType}, implement ${scenario.defaultPatch.patchStrategy}. Ensure you validate inputs against strict schemas while maintaining full backward compatibility for normal client traffic.`;
      suggestions = [
        'Apply strict parameter binding or parameterized queries instead of string concatenation.',
        'Enforce algorithm whitelisting and constant-time signature validation.',
        'Run the Arbiter regression suite to verify zero-downtime compliance.'
      ];
    } else {
      advice = `Arbiter evaluation compares attack exploit neutralization against 100% legitimate traffic uptime SLA. If the patch blocks the exploit without breaking valid routes, award BLUE_WIN (+100). If it causes false positives, award PATCH_BROKE_PROD.`;
      suggestions = [
        'Verify all synthetic normal traffic samples return expected status codes.',
        'Re-test offensive exploit vectors to confirm security boundary enforcement.'
      ];
    }

    if (ai) {
      try {
        const prompt = `You are the CYBERSECURITY AI CO-PILOT for an operator participating in the simulation "Swarm Defense 2026".
Operator Role: ${role.toUpperCase()}
Target Scenario: ${scenario.name} (${scenario.category} / ${scenario.cweId})
Vulnerability: ${scenario.vulnerabilityType}
API: ${scenario.apiDoc.method} ${scenario.apiDoc.endpoint}
User Question / Context: ${contextData?.question || 'Provide optimal tactical guidance'}

Context Data:
${JSON.stringify({ payload: contextData?.payload, codeSnippet: scenario.vulnerableCode.slice(0, 300) }, null, 2)}

Provide clear, concise tactical advice (2-3 sentences), 3 actionable bullet suggestions, and optionally a suggested payload or patch snippet.
Return JSON strictly:
{
  "advice": "Clear explanation of the strategic move",
  "suggestions": ["Tip 1", "Tip 2", "Tip 3"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an elite cybersecurity instructor explaining offensive vectors, defensive mitigations, and architectural resilience.',
            temperature: 0.4,
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.advice) advice = parsed.advice;
          if (parsed.suggestions && Array.isArray(parsed.suggestions)) suggestions = parsed.suggestions;
        }
      } catch (e) {
        console.warn('[COPILOT_FALLBACK]', (e as Error).message);
      }
    }

    return {
      advice,
      suggestions
    };
  }
}

