'use client';

import { FlowMatchFields, FlowProtocol } from '@/types/flow';

interface MatchFieldsEditorProps {
  match: FlowMatchFields;
  onChange: (match: FlowMatchFields) => void;
}

export function MatchFieldsEditor({ match, onChange }: MatchFieldsEditorProps) {
  const updateField = (field: keyof FlowMatchFields, value: any) => {
    onChange({ ...match, [field]: value || undefined });
  };

  const protocols: FlowProtocol[] = ['TCP', 'UDP', 'ICMP', 'ARP', 'ANY'];

  return (
    <div className="space-y-4">
      {/* Network Layer */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          네트워크 계층
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              소스 IP
            </label>
            <input
              type="text"
              value={match.srcIp || ''}
              onChange={(e) => updateField('srcIp', e.target.value)}
              placeholder="예: 192.168.1.0/24"
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              목적지 IP
            </label>
            <input
              type="text"
              value={match.dstIp || ''}
              onChange={(e) => updateField('dstIp', e.target.value)}
              placeholder="예: 10.0.0.0/8"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Data Link Layer */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          데이터 링크 계층
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              소스 MAC
            </label>
            <input
              type="text"
              value={match.srcMac || ''}
              onChange={(e) => updateField('srcMac', e.target.value)}
              placeholder="예: 00:11:22:33:44:55"
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              목적지 MAC
            </label>
            <input
              type="text"
              value={match.dstMac || ''}
              onChange={(e) => updateField('dstMac', e.target.value)}
              placeholder="예: AA:BB:CC:DD:EE:FF"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Transport Layer */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          전송 계층
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              프로토콜
            </label>
            <select
              value={match.protocol || 'ANY'}
              onChange={(e) => updateField('protocol', e.target.value)}
              className="input"
            >
              {protocols.map((proto) => (
                <option key={proto} value={proto}>
                  {proto}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              소스 포트
            </label>
            <input
              type="number"
              min="0"
              max="65535"
              value={match.srcPort || ''}
              onChange={(e) =>
                updateField('srcPort', e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="1-65535"
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              목적지 포트
            </label>
            <input
              type="number"
              min="0"
              max="65535"
              value={match.dstPort || ''}
              onChange={(e) =>
                updateField('dstPort', e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="1-65535"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* VLAN & Port */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          VLAN 및 포트
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              VLAN ID
            </label>
            <input
              type="number"
              min="0"
              max="4094"
              value={match.vlanId || ''}
              onChange={(e) =>
                updateField('vlanId', e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="1-4094"
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              입력 포트
            </label>
            <input
              type="number"
              min="0"
              value={match.inPort || ''}
              onChange={(e) =>
                updateField('inPort', e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="포트 번호"
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              EtherType
            </label>
            <input
              type="number"
              min="0"
              value={match.etherType || ''}
              onChange={(e) =>
                updateField('etherType', e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="예: 0x0800"
              className="input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
