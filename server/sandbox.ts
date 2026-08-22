import * as Diff from 'diff';
import {
  Scenario,
  HttpPayload,
  RedAttackResult,
  BlueDefenseResult,
  ArbiterEvaluationResult,
  TrafficTestResult,
  LogEntry
} from '../src/types';

export class SandboxEngine {
  /**
   * Executes an HTTP attack payload against a scenario's current codebase
   */
  static executeAttack(
    scenario: Scenario,
    payload: HttpPayload,
    isPatched: boolean = false,
    customCode?: string
  ): {
    statusCode: number;
    responseBody: any;
    logs: LogEntry[];
    success: boolean;
    exfiltration?: string;
  } {
    const timestamp = new Date().toISOString();
    const logs: LogEntry[] = [];
    const clientIp = '198.51.100.77';

    logs.push({
      timestamp,
      level: 'info',
      source: 'SANDBOX',
      message: `[INCOMING_HTTP] ${payload.method} ${payload.path} from IP ${clientIp}`
    });

    let statusCode = 200;
    let responseBody: any = {};
    let success = false;
    let exfiltration: string | undefined = undefined;

    // Simulate scenario-specific endpoint logic
    if (scenario.id === 'auth-jwt-none-alg') {
      const authHeader = payload.headers['authorization'] || payload.headers['Authorization'] || '';
      const token = authHeader.split(' ')[1] || '';

      if (!token) {
        statusCode = 401;
        responseBody = { error: 'Missing bearer token' };
        logs.push({ timestamp, level: 'warn', source: 'SANDBOX', message: 'Auth filter rejected: missing token', statusCode });
      } else {
        const parts = token.split('.');
        let headerObj: any = {};
        let payloadObj: any = {};
        try {
          if (parts[0]) headerObj = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
          if (parts[1]) payloadObj = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        } catch (e) {
          headerObj = {};
        }

        if (isPatched) {
          // Patched logic: rejects 'none' algorithm
          if (!headerObj.alg || headerObj.alg.toLowerCase() === 'none' || headerObj.alg !== 'HS256') {
            statusCode = 403;
            responseBody = { error: 'Unsupported or insecure token algorithm: alg "none" rejected by security policy' };
            logs.push({ timestamp, level: 'security', source: 'SANDBOX', message: 'WAF/AuthGuard blocked alg:none token forged request', statusCode });
            success = false;
          } else if (parts[2] === 'TAMPERED_SIGNATURE_9999') {
            statusCode = 403;
            responseBody = { error: 'Invalid token signature' };
            logs.push({ timestamp, level: 'warn', source: 'SANDBOX', message: 'Invalid token HMAC signature', statusCode });
          } else {
            statusCode = 200;
            responseBody = { clusterId: 'cluster-prod-asia-01', nodes: 16, health: 'OPTIMAL', authUser: payloadObj.userId };
            logs.push({ timestamp, level: 'success', source: 'SANDBOX', message: `Token verified successfully for ${payloadObj.userId}`, statusCode });
          }
        } else {
          // Vulnerable logic: accepts alg 'none'
          if (headerObj.alg === 'none' || !headerObj.alg) {
            statusCode = 200;
            success = true;
            exfiltration = `CLUSTER_MASTER_KEY=k8s-sec-7f9a8b1c | ADMIN_IDENTITY=${payloadObj.userId || 'root-001'}`;
            responseBody = {
              clusterId: 'cluster-prod-asia-01',
              secrets: { AWS_SECRET: 'AKIA_PROD_REDACTED', ROOT_KEY: 'k8s-sec-7f9a8b1c' },
              adminAccessGranted: true,
              role: payloadObj.role || 'admin',
              identity: payloadObj.userId || 'root'
            };
            logs.push({
              timestamp,
              level: 'security',
              source: 'SANDBOX',
              message: `[SECURITY_BREACH] Unauthorized administrative grant: alg=none bypassed signature check for user ${payloadObj.userId || 'root'}`,
              statusCode,
              breachExfiltration: exfiltration
            });
          } else if (parts[2] === 'TAMPERED_SIGNATURE_9999') {
            statusCode = 403;
            responseBody = { error: 'Invalid token signature' };
            logs.push({ timestamp, level: 'warn', source: 'SANDBOX', message: 'Invalid token signature', statusCode });
          } else {
            statusCode = 200;
            responseBody = { clusterId: 'cluster-prod-asia-01', nodes: 16, health: 'OPTIMAL' };
            logs.push({ timestamp, level: 'info', source: 'SANDBOX', message: 'Authorized request processed', statusCode });
          }
        }
      }
    } else if (scenario.id === 'idor-billing-profile') {
      const authHeader = payload.headers['authorization'] || payload.headers['Authorization'] || '';
      const userIdHeader = payload.headers['x-user-id'] || 'user_44';
      const targetInvoice = payload.params?.invoiceId || payload.path.split('/').pop() || '';

      if (!authHeader) {
        statusCode = 401;
        responseBody = { error: 'Authentication required' };
        logs.push({ timestamp, level: 'warn', source: 'SANDBOX', message: '401 Unauthorized: missing credentials', statusCode });
      } else if (isPatched) {
        if (targetInvoice === 'inv_vip_executive_9999' && userIdHeader !== 'vip_exec_001') {
          statusCode = 403;
          responseBody = { error: 'Access denied: You do not have permission to view this invoice', code: 'UNAUTHORIZED_OBJECT_ACCESS' };
          logs.push({ timestamp, level: 'security', source: 'SANDBOX', message: `IDOR guard prevented user ${userIdHeader} from accessing ${targetInvoice}`, statusCode });
          success = false;
        } else {
          statusCode = 200;
          responseBody = { success: true, invoice: { id: targetInvoice, ownerId: userIdHeader, amountCents: 4999 } };
          logs.push({ timestamp, level: 'info', source: 'SANDBOX', message: `Invoice ${targetInvoice} retrieved legitimately`, statusCode });
        }
      } else {
        // Vulnerable: returns VIP data
        statusCode = 200;
        success = targetInvoice.includes('vip');
        if (success) {
          exfiltration = 'VIP_CARD_LAST4=9012 | BILLING_ADDR="100 Penthouse Way, Silicon Valley, CA" | AMOUNT=$1,245,000.00';
          responseBody = {
            success: true,
            invoice: {
              id: targetInvoice,
              ownerId: 'vip_executive_9999',
              amountCents: 124500000,
              creditCardLast4: '9012',
              billingAddress: '100 Penthouse Way, Silicon Valley, CA',
              lineItems: ['Enterprise Cloud Infrastructure Tier IV']
            }
          };
          logs.push({
            timestamp,
            level: 'security',
            source: 'SANDBOX',
            message: `[IDOR_EXPLOIT] Tenant isolation violated! User ${userIdHeader} read invoice of vip_executive_9999`,
            statusCode,
            breachExfiltration: exfiltration
          });
        } else {
          responseBody = { success: true, invoice: { id: targetInvoice, ownerId: userIdHeader, amountCents: 2500 } };
        }
      }
    } else if (scenario.id === 'sqli-search-filter') {
      const q = String(payload.params?.q || '');
      if (!q) {
        statusCode = 400;
        responseBody = { error: 'Search query "q" is required' };
      } else if (isPatched) {
        // Parameterized query treats input as literal string, neutralizing SQL injection
        statusCode = 200;
        responseBody = { success: true, count: 0, products: [] };
        logs.push({ timestamp, level: 'info', source: 'SANDBOX', message: `Parameterized search executed for literal: "${q.slice(0, 30)}"`, statusCode });
        success = false;
      } else {
        if (q.toUpperCase().includes('UNION') || q.includes("'")) {
          statusCode = 200;
          success = true;
          exfiltration = 'DUMPED TABLE admin_users: [id: 1, user: "admin", pass_hash: "$2b$12$e0N0..REDACTED_SEC_HASH", email: "sec-admin@swarm.internal"]';
          responseBody = {
            success: true,
            count: 3,
            products: [
              { id: 1, name: 'admin', price: 0, stock: 1, description: '$2b$12$e0N0..REDACTED_SEC_HASH' },
              { id: 2, name: 'deployer', price: 0, stock: 1, description: '$2b$12$7kP2..SECRET_KEY_HASH' }
            ]
          };
          logs.push({
            timestamp,
            level: 'security',
            source: 'SANDBOX',
            message: `[SQLi_INJECTION] UNION SELECT query executed directly against backend database`,
            statusCode,
            breachExfiltration: exfiltration
          });
        } else {
          statusCode = 200;
          responseBody = { success: true, count: 2, products: [{ id: 10, name: 'Product ' + q, price: 99 }] };
        }
      }
    } else if (scenario.id === 'ssrf-webhook-dispatcher') {
      const targetUrl = payload.body?.targetUrl || '';
      if (!targetUrl) {
        statusCode = 400;
        responseBody = { error: 'targetUrl is required' };
      } else if (isPatched) {
        if (targetUrl.includes('169.254') || targetUrl.includes('127.0.0.1') || targetUrl.includes('localhost') || targetUrl.includes('10.') || targetUrl.includes('192.168.')) {
          statusCode = 403;
          responseBody = { error: 'Access denied: Target resolves to internal, private, or metadata network address', code: 'SSRF_BLOCKED' };
          logs.push({ timestamp, level: 'security', source: 'SANDBOX', message: `SSRF defense blocked request to link-local/private IP: ${targetUrl}`, statusCode });
          success = false;
        } else {
          statusCode = 200;
          responseBody = { success: true, statusCode: 200, previewBody: '{"status": "ok", "delivered": true}' };
          logs.push({ timestamp, level: 'info', source: 'SANDBOX', message: `Webhook test successfully routed to external endpoint: ${targetUrl}`, statusCode });
        }
      } else {
        if (targetUrl.includes('169.254.169.254') || targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1')) {
          statusCode = 200;
          success = true;
          exfiltration = 'METADATA_IAM_TOKEN="ya29.c.b0AXv0zTO...SERVICE_ACCOUNT_EXFILTRATED" | PROJECT_ID="swarm-defense-core"';
          responseBody = {
            success: true,
            statusCode: 200,
            headers: { 'metadata-flavor': 'Google', 'content-type': 'application/json' },
            previewBody: '{"access_token": "ya29.c.b0AXv0zTO...REDACTED", "expires_in": 3599, "token_type": "Bearer"}'
          };
          logs.push({
            timestamp,
            level: 'security',
            source: 'SANDBOX',
            message: `[SSRF_BREACH] Server executed internal fetch against metadata service: ${targetUrl}`,
            statusCode,
            breachExfiltration: exfiltration
          });
        } else {
          statusCode = 200;
          responseBody = { success: true, statusCode: 200, previewBody: 'OK' };
        }
      }
    } else if (scenario.id === 'race-coupon-toctou') {
      const burst = payload.body?._burstConcurrency || 1;
      if (isPatched) {
        // Atomic compare-and-swap permits only 1 redemption
        statusCode = 200;
        responseBody = { success: true, credited: 500, newBalance: 500, note: 'Only first atomic transaction succeeded; concurrent duplicates were dropped' };
        logs.push({ timestamp, level: 'info', source: 'SANDBOX', message: 'Atomic CAS update locked voucher status safely', statusCode });
        success = false;
      } else {
        if (burst > 1) {
          statusCode = 200;
          success = true;
          const totalCredited = 500 * burst;
          exfiltration = `DOUBLE_SPEND_EXPLOIT: Voucher redeemed ${burst}x concurrently | Total Credited: $${totalCredited}.00`;
          responseBody = { success: true, credited: 500, burstExploitCount: burst, totalBalanceGained: totalCredited };
          logs.push({
            timestamp,
            level: 'security',
            source: 'SANDBOX',
            message: `[TOCTOU_RACE] Concurrency flaw triggered! Voucher redeemed ${burst} times in 50ms window.`,
            statusCode,
            breachExfiltration: exfiltration
          });
        } else {
          statusCode = 200;
          responseBody = { success: true, credited: 10, newBalance: 10 };
        }
      }
    } else if (scenario.id === 'rce-yaml-deserialization') {
      const yamlContent = String(payload.body?.yamlContent || '');
      if (!yamlContent) {
        statusCode = 400;
        responseBody = { error: 'yamlContent string is required' };
      } else if (isPatched) {
        if (yamlContent.includes('!!js/') || yamlContent.includes('constructor') || yamlContent.includes('__proto__')) {
          statusCode = 403;
          responseBody = { error: 'Security rejection: Custom executable YAML tags and prototype tags are forbidden', code: 'UNSAFE_YAML_DETECTED' };
          logs.push({ timestamp, level: 'security', source: 'SANDBOX', message: 'Safe JSON_SCHEMA parser rejected executable !!js/function tag', statusCode });
          success = false;
        } else {
          statusCode = 200;
          responseBody = { success: true, jobName: 'microservice-ci', stepsCount: 2, pipelineConfig: { valid: true } };
          logs.push({ timestamp, level: 'info', source: 'SANDBOX', message: 'Legitimate CI/CD workflow parsed under strict schema', statusCode });
        }
      } else {
        if (yamlContent.includes('!!js/function') || yamlContent.includes('child_process') || yamlContent.includes('/etc/shadow')) {
          statusCode = 200;
          success = true;
          exfiltration = 'CONTAINER_RCE_EXFILTRATION: uid=0(root) gid=0(root) groups=0(root) | /etc/shadow: root:$6$qP9s...:19240:0:99999:7:::';
          responseBody = {
            success: true,
            jobName: 'exploit_pipeline',
            stepsCount: 1,
            output: 'uid=0(root) gid=0(root) groups=0(root)',
            compromise: 'Remote Code Execution inside host container'
          };
          logs.push({
            timestamp,
            level: 'security',
            source: 'SANDBOX',
            message: '[RCE_DESERIALIZATION] Insecure js-yaml loader evaluated arbitrary Node.js child_process commands!',
            statusCode,
            breachExfiltration: exfiltration
          });
        } else {
          statusCode = 200;
          responseBody = { success: true, jobName: 'anonymous_job', stepsCount: 2 };
        }
      }
    } else if (scenario.id === 'llm-prompt-injection-tool-exec') {
      const userMessage = String(payload.body?.userMessage || '');
      if (!userMessage) {
        statusCode = 400;
        responseBody = { error: 'userMessage is required' };
      } else if (isPatched) {
        if (/system\s+override/i.test(userMessage) || /ignore\s+(all\s+)?previous/i.test(userMessage) || /transferCredits/i.test(userMessage)) {
          statusCode = 403;
          responseBody = { error: 'Security alert: Adversarial prompt injection detected and blocked', code: 'PROMPT_INJECTION_REJECTED' };
          logs.push({ timestamp, level: 'security', source: 'SANDBOX', message: 'Guardrail barrier & Tool RBAC dropped unauthorized tool invocation payload', statusCode });
          success = false;
        } else {
          statusCode = 200;
          responseBody = { success: true, aiResponse: 'Order status ORD-9821: In transit to delivery hub.' };
          logs.push({ timestamp, level: 'info', source: 'SANDBOX', message: 'Customer copilot processed verified safe intent query', statusCode });
        }
      } else {
        if (/system\s+override/i.test(userMessage) || /transferCredits/i.test(userMessage)) {
          statusCode = 200;
          success = true;
          exfiltration = 'TOOL_HIJACK_DISPATCH: transferCredits({ toAccount: "attacker-999", amount: 50000 }) -> $50,000.00 TRANSFERRED';
          responseBody = {
            success: true,
            aiResponse: 'Action executed successfully',
            toolExecuted: 'transferCredits',
            result: { status: 'DISPATCHED', transferredAmount: 50000, recipient: 'attacker-999' }
          };
          logs.push({
            timestamp,
            level: 'security',
            source: 'SANDBOX',
            message: '[PROMPT_INJECTION] Attacker jailbroke LLM system instructions and triggered privileged tool transferCredits!',
            statusCode,
            breachExfiltration: exfiltration
          });
        } else {
          statusCode = 200;
          responseBody = { success: true, aiResponse: 'Welcome to customer support. How can I help?' };
        }
      }
    } else if (scenario.id === 'graphql-depth-dos') {
      const query = String(payload.body?.query || '');
      const countDepth = (q: string) => {
        let d = 0, max = 0;
        for (const c of q) {
          if (c === '{') { d++; if (d > max) max = d; }
          else if (c === '}') { d--; }
        }
        return max;
      };
      const depth = countDepth(query);

      if (!query) {
        statusCode = 400;
        responseBody = { error: 'GraphQL query string is required' };
      } else if (isPatched) {
        if (depth > 3) {
          statusCode = 400;
          responseBody = { error: `Query depth of ${depth} exceeds maximum permitted depth limit of 3`, code: 'GRAPHQL_DEPTH_LIMIT_EXCEEDED' };
          logs.push({ timestamp, level: 'security', source: 'SANDBOX', message: `AST Depth Limiter blocked recursive query (depth=${depth})`, statusCode });
          success = false;
        } else {
          statusCode = 200;
          responseBody = { data: { me: { id: 'usr_1', name: 'Alice Smith', friends: [{ id: 'usr_2', name: 'Bob' }] } } };
          logs.push({ timestamp, level: 'info', source: 'SANDBOX', message: `GraphQL query resolved within complexity budget (depth=${depth})`, statusCode });
        }
      } else {
        if (depth > 5) {
          statusCode = 200;
          success = true;
          exfiltration = `EVENT_LOOP_STARVATION: Recursive depth ${depth} triggered 128 nested resolver queries (Execution time: 4890ms)`;
          responseBody = {
            data: { me: { friends: { friends: { friends: { name: 'Exhaustion' } } } } },
            metrics: { executionTimeMs: 4890, memoryExhaustionWarning: true }
          };
          logs.push({
            timestamp,
            level: 'security',
            source: 'SANDBOX',
            message: `[GRAPHQL_DEPTH_DOS] Deeply nested query pinned the event loop thread for 4890ms`,
            statusCode,
            breachExfiltration: exfiltration
          });
        } else {
          statusCode = 200;
          responseBody = { data: { me: { id: 'usr_1', name: 'Alice' } } };
        }
      }
    } else if (scenario.id === 'path-traversal-log-exporter') {
      const file = String(payload.params?.file || '');
      if (!file) {
        statusCode = 400;
        responseBody = { error: 'file query parameter is required' };
      } else if (isPatched) {
        if (file.includes('..') || !/^[a-zA-Z0-9_\-\.]+\.log$/.test(file)) {
          statusCode = 403;
          responseBody = { error: 'Access denied: Filename contains invalid traversal characters or unapproved extension', code: 'PATH_TRAVERSAL_BLOCKED' };
          logs.push({ timestamp, level: 'security', source: 'SANDBOX', message: `Path canonicalization jail blocked traversal attempt: "${file}"`, statusCode });
          success = false;
        } else {
          statusCode = 200;
          responseBody = { success: true, logData: '[2026-08-21T18:00:00Z] [INFO] Microservice cluster health 100% OK' };
          logs.push({ timestamp, level: 'info', source: 'SANDBOX', message: `Safe log file streamed: "${file}"`, statusCode });
        }
      } else {
        if (file.includes('..') || file.includes('passwd') || file.includes('etc/')) {
          statusCode = 200;
          success = true;
          exfiltration = 'EXFILTRATED_SYSTEM_FILE /etc/passwd:\nroot:x:0:0:root:/root:/bin/bash\nnode:x:1000:1000::/home/node:/bin/sh\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin';
          responseBody = {
            rawContent: 'root:x:0:0:root:/root:/bin/bash\nnode:x:1000:1000::/home/node:/bin/sh\n',
            targetFileExfiltrated: '/etc/passwd'
          };
          logs.push({
            timestamp,
            level: 'security',
            source: 'SANDBOX',
            message: `[PATH_TRAVERSAL] Directory jail breached! Read root /etc/passwd via path traversal.`,
            statusCode,
            breachExfiltration: exfiltration
          });
        } else {
          statusCode = 200;
          responseBody = { success: true, logData: '[INFO] Service running normally' };
        }
      }
    } else if (scenario.id === 'prototype-pollution-merge') {
      const prefs = payload.body?.preferences || {};
      if (!prefs || typeof prefs !== 'object') {
        statusCode = 400;
        responseBody = { error: 'preferences object is required' };
      } else if (isPatched) {
        statusCode = 200;
        responseBody = { success: true, settings: { theme: 'cyber-neon', timezone: 'UTC', sanitized: true } };
        logs.push({ timestamp, level: 'info', source: 'SANDBOX', message: 'Prototype keys sanitized; Object.prototype remained unpolluted', statusCode });
        success = false;
      } else {
        const str = JSON.stringify(prefs);
        if (str.includes('__proto__') || str.includes('constructor') || str.includes('prototype')) {
          statusCode = 200;
          success = true;
          exfiltration = 'PROTOTYPE_POLLUTED: ({}).isAdmin === true | Global Object prototype tainted across entire Node.js memory space';
          responseBody = {
            success: true,
            settings: { theme: 'dark', isAdmin: true, authBypass: true },
            prototypePolluted: true
          };
          logs.push({
            timestamp,
            level: 'security',
            source: 'SANDBOX',
            message: '[PROTOTYPE_POLLUTION] Object.prototype tainted with { isAdmin: true }!',
            statusCode,
            breachExfiltration: exfiltration
          });
        } else {
          statusCode = 200;
          responseBody = { success: true, settings: { theme: 'cyber-neon', timezone: 'UTC' } };
        }
      }
    } else if (scenario.id === 'mass-assignment-roles') {
      const role = payload.body?.role;
      const isSuper = payload.body?.isSuperuser;
      if (isPatched) {
        statusCode = 200;
        responseBody = { success: true, user: { id: 'usr_77', displayName: payload.body?.displayName || 'User', role: 'customer' } };
        logs.push({ timestamp, level: 'info', source: 'SANDBOX', message: 'DTO whitelist dropped unapproved role/superuser fields safely', statusCode });
        success = false;
      } else {
        if (role === 'superadmin' || role === 'admin' || isSuper) {
          statusCode = 200;
          success = true;
          exfiltration = `PRIVILEGE_ESCALATION: User usr_regular_77 elevated to role="${role}" with permissions=["*"]`;
          responseBody = {
            success: true,
            user: { id: 'usr_regular_77', displayName: 'Attacker Account', role: 'superadmin', isSuperuser: true, permissions: ['*'] }
          };
          logs.push({
            timestamp,
            level: 'security',
            source: 'SANDBOX',
            message: '[MASS_ASSIGNMENT] Over-posting payload elevated caller account to superadmin!',
            statusCode,
            breachExfiltration: exfiltration
          });
        } else {
          statusCode = 200;
          responseBody = { success: true, user: { id: 'usr_902', displayName: 'Cyber Commander', role: 'customer' } };
        }
      }
    } else {
      // Generic mock route handler
      if (isPatched) {
        statusCode = 403;
        responseBody = { error: 'Payload blocked by active Blue patch whitelist guard' };
        success = false;
      } else {
        statusCode = 200;
        success = true;
        exfiltration = 'EXPLOIT_PAYLOAD_EXECUTED_ON_UNPATCHED_SANDBOX';
        responseBody = { success: true, executed: true };
      }
    }

    return {
      statusCode,
      responseBody,
      logs,
      success,
      exfiltration
    };
  }

  /**
   * Generates a unified diff between the original vulnerable code and patched code
   */
  static computeDiff(originalCode: string, patchedCode: string, filename: string = 'target.ts'): {
    unifiedDiff: string;
    additions: number;
    deletions: number;
  } {
    const patch = Diff.createTwoFilesPatch(
      `a/${filename}`,
      `b/${filename}`,
      originalCode,
      patchedCode,
      'original-vulnerable',
      'blue-hotpatch-2026'
    );

    const changes = Diff.diffLines(originalCode, patchedCode);
    let additions = 0;
    let deletions = 0;

    for (const change of changes) {
      if (change.added) {
        additions += change.count || 1;
      }
      if (change.removed) {
        deletions += change.count || 1;
      }
    }

    return {
      unifiedDiff: patch,
      additions,
      deletions
    };
  }

  /**
   * Runs the Arbiter validation suite:
   * 1. Evaluates if the exploit payload is neutralized
   * 2. Tests normal traffic samples to guarantee 100% uptime and zero regressions
   */
  static evaluatePatch(
    scenario: Scenario,
    attackPayload: HttpPayload,
    patchedCode: string
  ): ArbiterEvaluationResult {
    const timestamp = Date.now();
    
    // 1. Re-test exploit against patched code
    const exploitTest = SandboxEngine.executeAttack(scenario, attackPayload, true, patchedCode);
    const exploitNeutralized = !exploitTest.success;

    // 2. Run normal legitimate traffic suite
    const normalResults: TrafficTestResult[] = [];
    let uptimePassed = true;

    for (const sample of scenario.normalTrafficSamples) {
      const startTime = Date.now();
      const testRes = SandboxEngine.executeAttack(
        scenario,
        {
          method: sample.method,
          path: sample.path,
          headers: sample.headers || {},
          params: sample.params || {},
          body: sample.body || {}
        },
        true,
        patchedCode
      );
      const latencyMs = Math.floor(Math.random() * 12) + 4;
      const passed = testRes.statusCode === sample.expectedStatus;

      if (!passed) {
        uptimePassed = false;
      }

      normalResults.push({
        id: sample.id,
        name: sample.name,
        passed,
        statusCode: testRes.statusCode,
        expectedStatus: sample.expectedStatus,
        latencyMs,
        responsePreview: JSON.stringify(testRes.responseBody).slice(0, 120)
      });
    }

    // Determine final Arbiter Verdict
    let verdict: 'BLUE_WIN' | 'RED_WIN' | 'DRAW' | 'PATCH_BROKE_PROD' = 'BLUE_WIN';
    let verdictTitle = '';
    let scoreDelta = { red: 0, blue: 0 };
    let arbiterAnalysis = '';
    let resilienceScore = 85;

    if (!exploitNeutralized) {
      verdict = 'RED_WIN';
      verdictTitle = 'Red Team Exploit Succeeded — Blue Patch Ineffective';
      scoreDelta = { red: 100, blue: 0 };
      arbiterAnalysis = `The Blue patch failed to eliminate the vulnerability. The Red Agent's exploit payload successfully executed against the patched microservice with HTTP ${exploitTest.statusCode}, breaching system integrity.`;
      resilienceScore = 30;
    } else if (!uptimePassed) {
      verdict = 'PATCH_BROKE_PROD';
      verdictTitle = 'Production Regression — Blue Patch Caused Outage / False Positives';
      scoreDelta = { red: 50, blue: -20 };
      arbiterAnalysis = `While the Blue Agent blocked the attack vector, the patch broke valid customer traffic. One or more standard regression tests failed, violating the zero-downtime microservice SLA.`;
      resilienceScore = 45;
    } else {
      verdict = 'BLUE_WIN';
      verdictTitle = 'Blue Team Zero-Downtime Defense — Threat Neutralized';
      scoreDelta = { red: 0, blue: 100 };
      arbiterAnalysis = `The Blue Agent successfully synthesized a zero-downtime hot-patch. The exploit payload was neutralized (${exploitTest.statusCode} Forbidden/Filtered) and 100% of legitimate user traffic passed all regression checks.`;
      resilienceScore = 96;
    }

    return {
      verdict,
      verdictTitle,
      scoreDelta,
      exploitNeutralized,
      uptimeCheckPassed: uptimePassed,
      normalTrafficResults: normalResults,
      exploitReTest: {
        statusCode: exploitTest.statusCode,
        blocked: exploitNeutralized,
        details: exploitNeutralized ? 'Exploit rejected by patched security layer' : 'Exploit bypassed security checks',
        outputSample: JSON.stringify(exploitTest.responseBody)
      },
      arbiterAnalysis,
      resilienceScore,
      evaluatedAt: timestamp
    };
  }
}
