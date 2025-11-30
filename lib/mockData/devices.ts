import type {
  Device,
  DeviceGroup,
  GetDevicesResponse,
  DeviceConnectionTest,
  BackupFile,
  FirmwareVersion,
  DeviceLog,
  UpgradeProgress,
} from '@/types/device';

// 목업 디바이스 데이터 생성
export const generateMockDevices = (count: number = 50): Device[] => {
  const manufacturers = ['cisco', 'juniper', 'huawei', 'arista', 'hp', 'dell'] as const;
  const models = {
    cisco: ['Catalyst 9300', 'Nexus 9000', 'ASR 1000'],
    juniper: ['EX4300', 'QFX5100', 'MX960'],
    huawei: ['S5700', 'CE6800', 'NE40E'],
    arista: ['7050SX', '7280SR', '7500R'],
    hp: ['5130', '5510', '5900'],
    dell: ['S4048', 'S5232F', 'Z9100'],
  };
  const statuses = ['online', 'offline', 'error', 'maintenance'] as const;
  const protocols = ['ssh', 'telnet', 'snmp', 'netconf'] as const;
  const locations = [
    '서울 본사 1층',
    '서울 본사 2층',
    '서울 본사 3층',
    '부산 지점',
    '대구 지점',
    '인천 데이터센터',
  ];

  const devices: Device[] = [];

  for (let i = 0; i < count; i++) {
    const manufacturer = manufacturers[i % manufacturers.length];
    const model = models[manufacturer][i % models[manufacturer].length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const protocol = protocols[i % protocols.length];

    const device: Device = {
      id: `device-${i + 1}`,
      hostname: `${manufacturer}-sw-${String(i + 1).padStart(3, '0')}`,
      ip: `192.168.${Math.floor(i / 254) + 1}.${(i % 254) + 1}`,
      port: protocol === 'ssh' ? 22 : protocol === 'telnet' ? 23 : protocol === 'snmp' ? 161 : 830,
      protocol,
      manufacturer,
      model,
      firmwareVersion: `${Math.floor(Math.random() * 5) + 10}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`,
      serialNumber: `SN${String(i + 1).padStart(8, '0')}`,
      status,
      lastCommunication: Date.now() - Math.floor(Math.random() * 3600000),
      location: locations[i % locations.length],
      description: `${manufacturer.toUpperCase()} ${model} 스위치`,
      groupId: i % 3 === 0 ? 'group-1' : i % 3 === 1 ? 'group-2' : undefined,
      interfaces: status === 'online' ? [
        {
          name: 'GigabitEthernet0/1',
          ip: `10.0.${Math.floor(i / 254) + 1}.${(i % 254) + 1}`,
          mac: `00:${String(Math.floor(i / 256)).padStart(2, '0')}:${String(i % 256).padStart(2, '0')}:11:22:33`,
          status: 'up',
          speed: 1000,
          duplex: 'full',
          mtu: 1500,
        },
        {
          name: 'GigabitEthernet0/2',
          status: Math.random() > 0.3 ? 'up' : 'down',
          speed: 1000,
          duplex: 'full',
          mtu: 1500,
        },
      ] : undefined,
      stats: status === 'online' ? {
        cpuUsage: Math.floor(Math.random() * 80) + 10,
        memoryUsage: Math.floor(Math.random() * 70) + 20,
        diskUsage: Math.floor(Math.random() * 60) + 30,
        uptime: Math.floor(Math.random() * 2592000) + 86400,
        trafficIn: Math.floor(Math.random() * 100000000) + 1000000,
        trafficOut: Math.floor(Math.random() * 100000000) + 1000000,
      } : undefined,
      createdAt: Date.now() - Math.floor(Math.random() * 86400000 * 30),
      updatedAt: Date.now() - Math.floor(Math.random() * 86400000),
    };

    devices.push(device);
  }

  return devices;
};

// 목업 그룹 데이터
export const mockDeviceGroups: DeviceGroup[] = [
  {
    id: 'group-1',
    name: '코어 스위치',
    description: '핵심 네트워크 장비',
    color: '#3b82f6',
    icon: 'server',
    deviceCount: 12,
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'group-2',
    name: '액세스 스위치',
    description: '사용자 접근 장비',
    color: '#10b981',
    icon: 'network',
    deviceCount: 25,
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'group-3',
    name: '배포 스위치',
    description: '분산 네트워크 장비',
    color: '#f59e0b',
    icon: 'layers',
    deviceCount: 8,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000,
  },
];

// 목업 연결 테스트 결과
export const mockConnectionTest: DeviceConnectionTest = {
  success: true,
  message: '디바이스에 성공적으로 연결되었습니다.',
  latency: Math.floor(Math.random() * 50) + 10,
  deviceInfo: {
    manufacturer: 'cisco',
    model: 'Catalyst 9300',
    firmwareVersion: '16.12.4',
  },
};

// 목업 백업 파일 데이터
export const generateMockBackups = (deviceId: string, count: number = 5): BackupFile[] => {
  const backups: BackupFile[] = [];

  for (let i = 0; i < count; i++) {
    backups.push({
      id: `backup-${deviceId}-${i + 1}`,
      deviceId,
      filename: `${deviceId}_backup_${new Date(Date.now() - i * 86400000 * 7).toISOString().split('T')[0]}.cfg`,
      size: Math.floor(Math.random() * 1024000) + 50000,
      createdAt: Date.now() - i * 86400000 * 7,
      description: i === 0 ? '최신 백업' : `${i} 주 전 백업`,
    });
  }

  return backups;
};

// 목업 펌웨어 버전 데이터
export const mockFirmwareVersions: FirmwareVersion[] = [
  {
    version: '17.3.5',
    releaseDate: '2024-01-15',
    fileSize: 524288000,
    checksum: 'a1b2c3d4e5f6g7h8i9j0',
    releaseNotes: '보안 패치 및 성능 개선',
    compatibility: ['Catalyst 9300', 'Catalyst 9500'],
  },
  {
    version: '17.3.4',
    releaseDate: '2023-12-01',
    fileSize: 520192000,
    checksum: 'b2c3d4e5f6g7h8i9j0k1',
    releaseNotes: '버그 수정 및 안정성 향상',
    compatibility: ['Catalyst 9300', 'Catalyst 9500', 'Nexus 9000'],
  },
  {
    version: '16.12.8',
    releaseDate: '2023-10-20',
    fileSize: 512000000,
    checksum: 'c3d4e5f6g7h8i9j0k1l2',
    releaseNotes: 'LTS 버전 유지보수 릴리스',
    compatibility: ['Catalyst 9300', 'ASR 1000'],
  },
];

// 목업 디바이스 로그 데이터
export const generateMockLogs = (deviceId: string, limit: number = 100): DeviceLog[] => {
  const levels = ['info', 'warning', 'error', 'debug'] as const;
  const messages = [
    'Interface GigabitEthernet0/1 changed state to up',
    'Configuration saved to NVRAM',
    'SNMP trap sent: linkUp',
    'BGP neighbor 192.168.1.1 state changed to Established',
    'CPU utilization exceeded 80%',
    'Memory usage critical: 95%',
    'Port security violation on interface Gi0/2',
    'OSPF neighbor adjacency changed',
  ];

  const logs: DeviceLog[] = [];

  for (let i = 0; i < limit; i++) {
    logs.push({
      id: `log-${deviceId}-${i + 1}`,
      deviceId,
      timestamp: Date.now() - i * 60000,
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      source: Math.random() > 0.5 ? 'system' : 'snmp',
    });
  }

  return logs;
};

// 목업 업그레이드 진행률 데이터
export const mockUpgradeProgress: UpgradeProgress = {
  deviceId: 'device-1',
  status: 'downloading',
  progress: 45,
  currentStep: '펌웨어 파일 다운로드 중...',
  message: '524MB 중 235MB 다운로드됨',
};

// 저장된 목업 데이터
let cachedMockDevices: Device[] | null = null;

export const getMockDevices = (): Device[] => {
  if (!cachedMockDevices) {
    cachedMockDevices = generateMockDevices(50);
  }
  return cachedMockDevices;
};

// 필터링 및 정렬된 목업 데이터 응답 생성
export const getMockDevicesResponse = (params: {
  page?: number;
  pageSize?: number;
  filter?: any;
  sort?: any;
}): GetDevicesResponse => {
  const { page = 1, pageSize = 25, filter, sort } = params;

  let devices = getMockDevices();

  // 필터링
  if (filter) {
    if (filter.statuses && filter.statuses.length > 0) {
      devices = devices.filter(d => filter.statuses.includes(d.status));
    }
    if (filter.manufacturers && filter.manufacturers.length > 0) {
      devices = devices.filter(d => filter.manufacturers.includes(d.manufacturer));
    }
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      devices = devices.filter(d =>
        d.hostname.toLowerCase().includes(query) ||
        d.ip.includes(query) ||
        d.model.toLowerCase().includes(query)
      );
    }
    if (filter.ipRange) {
      // IP 범위 필터링 (간단한 구현)
      devices = devices.filter(d =>
        d.ip >= filter.ipRange.start && d.ip <= filter.ipRange.end
      );
    }
    if (filter.groupId) {
      devices = devices.filter(d => d.groupId === filter.groupId);
    }
  }

  // 정렬
  if (sort && sort.field) {
    devices.sort((a, b) => {
      const aValue = a[sort.field as keyof Device];
      const bValue = b[sort.field as keyof Device];

      if (aValue === undefined || bValue === undefined) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }

      return sort.order === 'asc' ? comparison : -comparison;
    });
  }

  // 페이지네이션
  const total = devices.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedDevices = devices.slice(start, end);

  return {
    devices: paginatedDevices,
    total,
    page,
    pageSize,
    totalPages,
  };
};
