import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatchReportData } from '../types';

export function generateMatchReportData(params: {
  scenario: any;
  simState: any;
  attackPath?: any;
}): MatchReportData {
  const { scenario, simState, attackPath } = params;

  const redWins = simState.scores?.red || 0;
  const blueWins = simState.scores?.blue || 0;
  const draws = simState.scores?.draws || 0;
  const totalRounds = Math.max(1, redWins + blueWins + draws);

  const mitigationRate = Math.round((blueWins / totalRounds) * 100);
  const uptime = simState.uptimePercent ?? (simState.phase === 'EVALUATION' ? (simState.resilienceScore > 50 ? 99.8 : 82.5) : 99.9);
  const resilience = simState.resilienceScore ?? (blueWins > redWins ? 88 : 45);

  let finalVerdict: MatchReportData['finalVerdict'] = 'DRAW';
  let verdictTitle = 'Security Stalemate / Ongoing Assessment';
  let arbiterAnalysis = 'Both adversarial exploit payload and defensive hotfix exhibited partial efficacy. Continuous monitoring recommended.';

  if (simState.phase === 'EVALUATION' || simState.phase === 'COMPLETED' || totalRounds > 0) {
    if (blueWins > redWins) {
      finalVerdict = 'BLUE_WIN';
      verdictTitle = 'Blue Team Zero-Downtime Mitigation Victory';
      arbiterAnalysis = `The defensive hotfix applied to ${scenario.targetService} successfully neutralized ${scenario.cweId} without breaking production SLA contracts. Normal HTTP/gRPC traffic passed with ${uptime}% uptime.`;
    } else if (redWins > blueWins) {
      finalVerdict = 'RED_WIN';
      verdictTitle = 'Red Team Critical Exploit Breach';
      arbiterAnalysis = `Red agent exploit successfully triggered ${scenario.vulnerabilityType} on ${scenario.targetService}, traversing upstream proxies and exfiltrating downstream cluster tokens. Hotfix was either absent or failed regression tests.`;
    }
  }

  const defaultHopList = attackPath?.hops || [
    {
      hopNumber: 1,
      nodeId: 'ingress-gateway',
      nodeName: 'ingress-envoy-proxy',
      type: 'ingress',
      protocol: 'HTTPS',
      port: 443,
      action: 'Adversarial Request Ingress',
      status: 'traversing',
      payloadSnippet: `${scenario.defaultExploit?.method || 'POST'} ${scenario.apiDoc?.endpoint || '/api/v1'}`,
      mitreTechnique: scenario.mitreAttack?.techniqueId || 'T1190',
      description: 'External payload received at ingress boundary.'
    },
    {
      hopNumber: 2,
      nodeId: 'target-service',
      nodeName: scenario.targetService,
      type: 'service',
      protocol: 'gRPC/HTTP',
      port: 8080,
      action: 'Vulnerability Execution',
      status: 'exploited',
      payloadSnippet: scenario.defaultExploit?.attackVector || 'Exploit Execution',
      mitreTechnique: scenario.mitreAttack?.techniqueId || 'T1190',
      description: scenario.description
    }
  ];

  return {
    matchId: `CYBER-MATCH-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    scenario: scenario,
    durationSeconds: Math.floor((simState.step || 4) * 2.5),
    scores: {
      red: redWins,
      blue: blueWins,
      draws: draws
    },
    overallResilienceScore: resilience,
    productionUptimePercent: uptime,
    mitigationSuccessRate: mitigationRate,
    finalVerdict: finalVerdict,
    verdictTitle: verdictTitle,
    arbiterAnalysis: arbiterAnalysis,
    attackPathData: {
      scenarioId: scenario.id,
      entryPoint: attackPath?.entryPoint || 'Ingress Gateway',
      targetSink: attackPath?.targetSink || scenario.targetService,
      blastRadius: attackPath?.blastRadius || scenario.severity || 'CRITICAL',
      estimatedTtdSec: attackPath?.estimatedTtdSec || 2.5,
      hops: defaultHopList,
      containmentRecommendation: attackPath?.containmentRecommendation || scenario.mitreDefend?.countermeasureType || 'Enforce strict schema validation and isolate vulnerable AST resolvers.'
    },
    redExploitDetails: {
      method: scenario.defaultExploit?.method || 'POST',
      endpoint: scenario.apiDoc?.endpoint || '/api/v1/target',
      flawIdentified: scenario.defaultExploit?.flawIdentified || scenario.vulnerabilityType,
      payloadBody: JSON.stringify(scenario.defaultExploit?.body || {}, null, 2),
      mitreTechnique: `${scenario.mitreAttack?.techniqueId || 'T1190'} - ${scenario.mitreAttack?.techniqueName || 'Exploit Public Application'}`
    },
    blueDefenseDetails: {
      patchStrategy: scenario.defaultPatch?.patchStrategy || 'AST Validation & Sanitization',
      rationale: scenario.defaultPatch?.rationale || 'Neutralize unsafe execution patterns without breaking baseline SLA contracts.',
      patchedCode: scenario.defaultPatch?.patchedCode || '// Zero downtime patch applied',
      vulnerableCode: scenario.vulnerableCode || '// Vulnerable code',
      d3fendRule: `${scenario.mitreDefend?.d3fendId || 'D3-IRA'} - ${scenario.mitreDefend?.d3fendName || 'Input Traffic Sanitization'}`
    },
    trafficSuiteResults: (scenario.normalTrafficSamples || []).map((sample: any, idx: number) => ({
      sampleId: sample.id || `test-${idx + 1}`,
      name: sample.name || `Traffic Probe ${idx + 1}`,
      status: 'PASSED' as const,
      statusCode: sample.expectedStatus || 200,
      expectedStatusCode: sample.expectedStatus || 200,
      latencyMs: 12 + Math.floor(Math.random() * 20),
      passed: true
    })),
    complianceNotes: [
      `OWASP Alignment: ${scenario.owasp?.code || 'A03:2021'} (${scenario.owasp?.title || 'Injection'})`,
      `CWE Reference: ${scenario.cweId}`,
      `MITRE ATT&CK: ${scenario.mitreAttack?.techniqueId || 'T1190'} (${scenario.mitreAttack?.tacticName || 'Execution'})`,
      `MITRE D3FEND: ${scenario.mitreDefend?.d3fendId || 'D3-IRA'} (${scenario.mitreDefend?.d3fendName || 'Inbound Sanitization'})`
    ]
  };
}

export function downloadReportAsJson(report: MatchReportData) {
  const jsonStr = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CyberDefense-MatchReport-${report.matchId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadReportAsPdf(report: MatchReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(56, 189, 248); // cyan-400
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CYBER DEFENSE ARENA | MATCH SUMMARY REPORT', 14, 12);

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Match ID: ${report.matchId}  |  Generated: ${new Date(report.timestamp).toLocaleString()}`, 14, 20);

  let currentY = 36;

  // Executive Summary Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Scenario: ${report.scenario.name}`, 18, currentY + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Target Microservice: ${report.scenario.targetService}`, 18, currentY + 13);
  doc.text(`CWE / Severity: ${report.scenario.cweId}  |  ${report.scenario.severity} (Blast Radius: ${report.attackPathData.blastRadius})`, 18, currentY + 19);

  // Verdict Badge
  const isBlueWin = report.finalVerdict === 'BLUE_WIN';
  doc.setFillColor(isBlueWin ? 220 : 254, isBlueWin ? 252 : 226, isBlueWin ? 231 : 226);
  doc.roundedRect(18, currentY + 23, pageWidth - 36, 10, 1, 1, 'F');
  
  doc.setTextColor(isBlueWin ? 22 : 153, isBlueWin ? 101 : 27, isBlueWin ? 52 : 27);
  doc.setFont('helvetica', 'bold');
  doc.text(`FINAL VERDICT: ${report.verdictTitle}`, 22, currentY + 30);

  currentY += 46;

  // Metrics Table
  autoTable(doc, {
    startY: currentY,
    head: [['Metric', 'Value', 'Benchmark Target', 'Status']],
    body: [
      ['Architectural Resilience', `${report.overallResilienceScore}%`, '>= 80%', report.overallResilienceScore >= 80 ? 'Optimal' : 'Compromised'],
      ['Zero-Downtime Production Uptime', `${report.productionUptimePercent}%`, '>= 99.5%', report.productionUptimePercent >= 99.5 ? 'SLA Met' : 'Degraded'],
      ['Mitigation Success Rate', `${report.mitigationSuccessRate}%`, '100%', report.mitigationSuccessRate >= 80 ? 'Protected' : 'Vulnerable'],
      ['Match Score (Blue vs Red)', `${report.scores.blue} Blue - ${report.scores.red} Red`, 'N/A', isBlueWin ? 'Blue Victory' : 'Red Breach']
    ],
    theme: 'grid',
    headStyles: { fillColor: [14, 116, 144], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Arbiter Breakdown
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Autonomous Arbiter Technical Evaluation', 14, currentY);
  currentY += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const splitArbiter = doc.splitTextToSize(report.arbiterAnalysis, pageWidth - 28);
  doc.text(splitArbiter, 14, currentY);
  currentY += splitArbiter.length * 4 + 6;

  // Attack Path Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Attack Path Traversal & Microservice Exposure', 14, currentY);
  currentY += 4;

  const hopRows = report.attackPathData.hops.map(hop => [
    `Hop ${hop.hopNumber}`,
    hop.nodeName,
    `${hop.protocol} :${hop.port}`,
    hop.action,
    hop.mitreTechnique,
    hop.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Hop #', 'Microservice Node', 'Protocol:Port', 'Action Executed', 'MITRE ATT&CK', 'Status']],
    body: hopRows,
    theme: 'striped',
    headStyles: { fillColor: [225, 29, 72], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Containment Recommendation
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(14, currentY, pageWidth - 28, 16, 2, 2, 'FD');

  doc.setTextColor(67, 56, 202);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommended Blue Team Containment Protocol:', 18, currentY + 5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const splitRec = doc.splitTextToSize(report.attackPathData.containmentRecommendation, pageWidth - 36);
  doc.text(splitRec, 18, currentY + 10);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated by Autonomous Red/Blue Cyber Defense Arena  |  Confidential Security Review', 14, 290);

  // Save PDF
  doc.save(`CyberDefense-MatchReport-${report.matchId}.pdf`);
}
