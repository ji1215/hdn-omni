import { Port, PortStatsSummary, PortStatus, PortSpeed } from '@/types/port';

/**
 * 포트 관리 서비스
 * Mock 데이터 생성 및 API 호출 시뮬레이션
 */

// Mock 포트 데이터 생성
export const generateMockPorts = (count: number = 50): Port[] => {
  const statuses: PortStatus[] = ['up', 'down', 'disabled'];
  const speeds: PortSpeed[] = ['10M', '100M', '1G', '10G', '40G', '100G'];
  const devices = [
    { id: 'device-1', name: 'Core-Switch-01' },
    { id: 'device-2', name: 'Core-Switch-02' },
    { id: 'device-3', name: 'Aggregation-SW-01' },
    { id: 'device-4', name: 'Aggregation-SW-02' },
    { id: 'device-5', name: 'Access-SW-01' },
    { id: 'device-6', name: 'Access-SW-02' },
  ];

  return Array.from({ length: count }, (_, index) => {
    const device = devices[index % devices.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const speed = speeds[Math.floor(Math.random() * speeds.length)];
    const utilization = status === 'up' ? Math.random() * 100 : 0;
    const hasErrors = Math.random() < 0.1; // 10% chance of errors

    return {
      id: `port-${index + 1}`,
      name: `eth0/${index + 1}`,
      deviceId: device.id,
      deviceName: device.name,
      status,
      speed,
      duplex: status === 'up' ? (Math.random() < 0.9 ? 'full' : 'half') : 'auto',
      vlanId: Math.random() < 0.7 ? Math.floor(Math.random() * 100) + 1 : undefined,
      description: Math.random() < 0.5 ? `Port ${index + 1} description` : undefined,
      macAddress: `00:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}`,
      mtu: 1500,
      enabled: status !== 'disabled',
      traffic: {
        txPackets: Math.floor(Math.random() * 1000000),
        rxPackets: Math.floor(Math.random() * 1000000),
        txBytes: Math.floor(Math.random() * 10000000000),
        rxBytes: Math.floor(Math.random() * 10000000000),
        errors: hasErrors ? Math.floor(Math.random() * 100) : 0,
        drops: hasErrors ? Math.floor(Math.random() * 50) : 0,
        utilization: Math.floor(utilization),
      },
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

// 포트 목록 조회 (Mock)
export async function fetchPorts(): Promise<Port[]> {
  // API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 로컬 스토리지에서 캐시된 데이터 확인
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('mockPorts');
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const ports = generateMockPorts(100);

  // 로컬 스토리지에 캐시
  if (typeof window !== 'undefined') {
    localStorage.setItem('mockPorts', JSON.stringify(ports));
  }

  return ports;
}

// 포트 통계 요약 조회
export async function fetchPortStats(): Promise<PortStatsSummary> {
  const ports = await fetchPorts();

  return {
    total: ports.length,
    active: ports.filter(p => p.status === 'up').length,
    inactive: ports.filter(p => p.status === 'down').length,
    errors: ports.filter(p => p.traffic.errors > 0 || p.traffic.drops > 0).length,
  };
}

// 특정 포트 조회
export async function fetchPort(id: string): Promise<Port | null> {
  const ports = await fetchPorts();
  return ports.find(p => p.id === id) || null;
}

// 포트 구성 업데이트 (Mock)
export async function updatePort(id: string, updates: Partial<Port>): Promise<Port> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const ports = await fetchPorts();
  const index = ports.findIndex(p => p.id === id);

  if (index === -1) {
    throw new Error('Port not found');
  }

  const updatedPort = {
    ...ports[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  ports[index] = updatedPort;

  if (typeof window !== 'undefined') {
    localStorage.setItem('mockPorts', JSON.stringify(ports));
  }

  return updatedPort;
}

// 포트 재시작 (Mock)
export async function restartPort(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`Port ${id} restarted`);
  return true;
}

// 일괄 포트 업데이트 (Mock)
export async function bulkUpdatePorts(ids: string[], updates: Partial<Port>): Promise<Port[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const ports = await fetchPorts();
  const updatedPorts: Port[] = [];

  ids.forEach(id => {
    const index = ports.findIndex(p => p.id === id);
    if (index !== -1) {
      const updatedPort = {
        ...ports[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      ports[index] = updatedPort;
      updatedPorts.push(updatedPort);
    }
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem('mockPorts', JSON.stringify(ports));
  }

  return updatedPorts;
}
