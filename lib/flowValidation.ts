import {
  FlowRule,
  FlowValidationResult,
  FlowConflict,
  FlowMatchFields,
} from '@/types/flow';

export function validateFlowRule(
  rule: Partial<FlowRule>,
  existingRules: FlowRule[] = []
): FlowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const conflicts: FlowConflict[] = [];

  // Basic validation
  if (!rule.name || rule.name.trim() === '') {
    errors.push('규칙 이름은 필수입니다');
  }

  if (rule.priority === undefined || rule.priority < 0 || rule.priority > 65535) {
    errors.push('우선순위는 0-65535 사이여야 합니다');
  }

  if (!rule.match || Object.keys(rule.match).length === 0) {
    warnings.push('매치 필드가 비어있습니다. 모든 패킷과 매칭됩니다');
  }

  if (!rule.actions || rule.actions.length === 0) {
    errors.push('최소 하나의 액션이 필요합니다');
  }

  // Match field validation
  if (rule.match) {
    validateMatchFields(rule.match, errors, warnings);
  }

  // Actions validation
  if (rule.actions) {
    rule.actions.forEach((action, index) => {
      if (action.type === 'FORWARD' && action.outputPort === undefined) {
        errors.push(`액션 ${index + 1}: FORWARD 액션에는 출력 포트가 필요합니다`);
      }
      if (action.type === 'QUEUE') {
        if (action.queueId === undefined) {
          errors.push(`액션 ${index + 1}: QUEUE 액션에는 큐 ID가 필요합니다`);
        }
        if (action.outputPort === undefined) {
          errors.push(`액션 ${index + 1}: QUEUE 액션에는 출력 포트가 필요합니다`);
        }
      }
      if (action.type === 'MODIFY' && !action.modifyFields) {
        warnings.push(`액션 ${index + 1}: MODIFY 액션에 수정할 필드가 없습니다`);
      }
    });
  }

  // Timeout validation
  if (rule.timeout) {
    if (
      rule.timeout.hardTimeout &&
      (rule.timeout.hardTimeout < 0 || rule.timeout.hardTimeout > 65535)
    ) {
      errors.push('Hard timeout은 0-65535 사이여야 합니다');
    }
    if (
      rule.timeout.idleTimeout &&
      (rule.timeout.idleTimeout < 0 || rule.timeout.idleTimeout > 65535)
    ) {
      errors.push('Idle timeout은 0-65535 사이여야 합니다');
    }
  }

  // Check conflicts with existing rules
  if (rule.id) {
    const ruleConflicts = detectConflicts(rule as FlowRule, existingRules);
    conflicts.push(...ruleConflicts);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    conflicts,
  };
}

function validateMatchFields(
  match: FlowMatchFields,
  errors: string[],
  warnings: string[]
): void {
  // IP validation
  if (match.srcIp && !isValidIP(match.srcIp)) {
    errors.push(`잘못된 소스 IP 형식: ${match.srcIp}`);
  }
  if (match.dstIp && !isValidIP(match.dstIp)) {
    errors.push(`잘못된 목적지 IP 형식: ${match.dstIp}`);
  }

  // MAC validation
  if (match.srcMac && !isValidMAC(match.srcMac)) {
    errors.push(`잘못된 소스 MAC 형식: ${match.srcMac}`);
  }
  if (match.dstMac && !isValidMAC(match.dstMac)) {
    errors.push(`잘못된 목적지 MAC 형식: ${match.dstMac}`);
  }

  // Port validation
  if (match.srcPort !== undefined && (match.srcPort < 0 || match.srcPort > 65535)) {
    errors.push('소스 포트는 0-65535 사이여야 합니다');
  }
  if (match.dstPort !== undefined && (match.dstPort < 0 || match.dstPort > 65535)) {
    errors.push('목적지 포트는 0-65535 사이여야 합니다');
  }

  // VLAN validation
  if (match.vlanId !== undefined && (match.vlanId < 1 || match.vlanId > 4094)) {
    errors.push('VLAN ID는 1-4094 사이여야 합니다');
  }

  // Protocol + Port consistency
  if ((match.srcPort !== undefined || match.dstPort !== undefined) &&
      match.protocol && !['TCP', 'UDP'].includes(match.protocol)) {
    warnings.push('포트는 TCP 또는 UDP 프로토콜에만 적용됩니다');
  }
}

function isValidIP(ip: string): boolean {
  // Simple IP/CIDR validation
  const parts = ip.split('/');
  const ipPart = parts[0];
  const octets = ipPart.split('.');

  if (octets.length !== 4) return false;

  for (const octet of octets) {
    const num = parseInt(octet);
    if (isNaN(num) || num < 0 || num > 255) return false;
  }

  if (parts.length === 2) {
    const cidr = parseInt(parts[1]);
    if (isNaN(cidr) || cidr < 0 || cidr > 32) return false;
  }

  return true;
}

function isValidMAC(mac: string): boolean {
  // MAC address validation (XX:XX:XX:XX:XX:XX format)
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
}

function detectConflicts(rule: FlowRule, existingRules: FlowRule[]): FlowConflict[] {
  const conflicts: FlowConflict[] = [];

  existingRules.forEach((existing) => {
    if (existing.id === rule.id) return; // Skip self

    // Check for exact match overlap
    if (matchFieldsOverlap(rule.match, existing.match)) {
      // Check priority
      if (rule.priority === existing.priority) {
        conflicts.push({
          rule1Id: rule.id,
          rule2Id: existing.id,
          type: 'overlap',
          severity: 'major',
          description: `규칙 "${existing.name}"과 매치 필드가 겹치고 우선순위가 동일합니다`,
          suggestion: '우선순위를 다르게 설정하거나 매치 필드를 더 구체적으로 지정하세요',
        });
      } else if (rule.priority < existing.priority) {
        // Lower priority value = higher priority
        conflicts.push({
          rule1Id: rule.id,
          rule2Id: existing.id,
          type: 'shadowing',
          severity: 'minor',
          description: `이 규칙이 "${existing.name}" 규칙을 가릴 수 있습니다`,
          suggestion: '의도된 동작인지 확인하세요',
        });
      }
    }

    // Check for redundancy
    if (isRedundant(rule, existing)) {
      conflicts.push({
        rule1Id: rule.id,
        rule2Id: existing.id,
        type: 'redundancy',
        severity: 'minor',
        description: `규칙 "${existing.name}"과 중복될 수 있습니다`,
        suggestion: '하나의 규칙을 제거하는 것을 고려하세요',
      });
    }
  });

  return conflicts;
}

function matchFieldsOverlap(match1: FlowMatchFields, match2: FlowMatchFields): boolean {
  // Check if match fields overlap
  const keys = Array.from(new Set([...Object.keys(match1), ...Object.keys(match2)]));

  for (const key of keys) {
    const value1 = (match1 as any)[key];
    const value2 = (match2 as any)[key];

    // If both have the same field and values differ, no overlap
    if (value1 !== undefined && value2 !== undefined && value1 !== value2) {
      return false;
    }
  }

  return true;
}

function isRedundant(rule1: FlowRule, rule2: FlowRule): boolean {
  // Check if rules are redundant (same match and actions)
  const matchSame = JSON.stringify(rule1.match) === JSON.stringify(rule2.match);
  const actionsSame = JSON.stringify(rule1.actions) === JSON.stringify(rule2.actions);

  return matchSame && actionsSame;
}

export function simulatePacket(
  packet: any,
  rules: FlowRule[]
): { matchedRule: FlowRule | null; action: string } {
  // Sort rules by priority (lower value = higher priority)
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  for (const rule of sortedRules) {
    if (packetMatchesRule(packet, rule)) {
      return {
        matchedRule: rule,
        action: rule.actions[0]?.type || 'NONE',
      };
    }
  }

  return { matchedRule: null, action: 'DEFAULT' };
}

function packetMatchesRule(packet: any, rule: FlowRule): boolean {
  const match = rule.match;

  if (match.srcIp && packet.srcIp !== match.srcIp) return false;
  if (match.dstIp && packet.dstIp !== match.dstIp) return false;
  if (match.srcMac && packet.srcMac !== match.srcMac) return false;
  if (match.dstMac && packet.dstMac !== match.dstMac) return false;
  if (match.srcPort && packet.srcPort !== match.srcPort) return false;
  if (match.dstPort && packet.dstPort !== match.dstPort) return false;
  if (match.protocol && packet.protocol !== match.protocol) return false;
  if (match.vlanId && packet.vlanId !== match.vlanId) return false;
  if (match.inPort && packet.inPort !== match.inPort) return false;

  return true;
}
