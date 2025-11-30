/**
 * 디바이스 관리 API 서비스
 * 디바이스 CRUD, 작업 실행, 그룹 관리 등의 API 호출
 */

import { api, httpClient } from '@/lib/httpClient';
import {
  getMockDevicesResponse,
  getMockDevices,
  mockDeviceGroups,
  mockConnectionTest,
  generateMockBackups,
  mockFirmwareVersions,
  generateMockLogs,
  mockUpgradeProgress,
} from '@/lib/mockData/devices';
import type {
  Device,
  AddDeviceRequest,
  UpdateDeviceRequest,
  DeviceConnectionTest,
  DeviceGroup,
  CreateGroupRequest,
  FirmwareVersion,
  BackupFile,
  DeviceActionRequest,
  DeviceActionResult,
  BatchActionRequest,
  BatchActionResult,
  GetDevicesParams,
  GetDevicesResponse,
  DeviceLog,
  UpgradeProgress,
} from '@/types/device';

// 개발 모드에서 목업 데이터 사용 여부
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || true;

/**
 * 디바이스 API 엔드포인트
 */
const DEVICE_ENDPOINTS = {
  // 디바이스 관리
  LIST: '/api/devices',
  GET: (id: string) => `/api/devices/${id}`,
  CREATE: '/api/devices',
  UPDATE: (id: string) => `/api/devices/${id}`,
  DELETE: (id: string) => `/api/devices/${id}`,

  // 디바이스 작업
  ACTION: (id: string) => `/api/devices/${id}/action`,
  REBOOT: (id: string) => `/api/devices/${id}/reboot`,
  DEVICE_BACKUP: (id: string) => `/api/devices/${id}/backup`,
  RESTORE: (id: string) => `/api/devices/${id}/restore`,
  UPGRADE: (id: string) => `/api/devices/${id}/upgrade`,
  TEST_CONNECTION: (id: string) => `/api/devices/${id}/test`,

  // 디바이스 정보
  INTERFACES: (id: string) => `/api/devices/${id}/interfaces`,
  STATS: (id: string) => `/api/devices/${id}/stats`,
  LOGS: (id: string) => `/api/devices/${id}/logs`,

  // 일괄 작업
  BATCH_ACTION: '/api/devices/batch-action',
  BATCH_DELETE: '/api/devices/batch-delete',

  // 그룹 관리
  GROUPS: '/api/device-groups',
  GROUP: (id: string) => `/api/device-groups/${id}`,
  GROUP_DEVICES: (id: string) => `/api/device-groups/${id}/devices`,
  ASSIGN_TO_GROUP: (deviceId: string) => `/api/devices/${deviceId}/group`,

  // 펌웨어
  FIRMWARE_VERSIONS: '/api/firmware/versions',
  FIRMWARE_VERSION: (version: string) => `/api/firmware/versions/${version}`,

  // 백업
  BACKUPS: '/api/backups',
  BACKUP: (id: string) => `/api/backups/${id}`,
  DEVICE_BACKUPS: (deviceId: string) => `/api/devices/${deviceId}/backups`,
};

/**
 * 디바이스 서비스
 */
export const deviceService = {
  /**
   * 디바이스 목록 조회
   */
  async getDevices(params: GetDevicesParams = {}): Promise<GetDevicesResponse> {
    // 목업 데이터 사용
    if (USE_MOCK_DATA) {
      // 약간의 지연을 추가하여 실제 API처럼 보이게 함
      await new Promise(resolve => setTimeout(resolve, 300));
      return getMockDevicesResponse(params);
    }

    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      // 필터
      if (params.filter) {
        if (params.filter.statuses) {
          params.filter.statuses.forEach((status) =>
            queryParams.append('status', status)
          );
        }
        if (params.filter.manufacturers) {
          params.filter.manufacturers.forEach((manufacturer) =>
            queryParams.append('manufacturer', manufacturer)
          );
        }
        if (params.filter.ipRange) {
          queryParams.append('ipStart', params.filter.ipRange.start);
          queryParams.append('ipEnd', params.filter.ipRange.end);
        }
        if (params.filter.searchQuery) {
          queryParams.append('search', params.filter.searchQuery);
        }
        if (params.filter.groupId) {
          queryParams.append('groupId', params.filter.groupId);
        }
      }

      // 정렬
      if (params.sort) {
        queryParams.append('sortBy', params.sort.field);
        queryParams.append('sortOrder', params.sort.order);
      }

      const response = await api.get<GetDevicesResponse>(
        `${DEVICE_ENDPOINTS.LIST}?${queryParams.toString()}`
      );

      return response.data.data;
    } catch (error) {
      console.warn('API 호출 실패, 목업 데이터 사용:', error);
      return getMockDevicesResponse(params);
    }
  },

  /**
   * 디바이스 상세 조회
   */
  async getDevice(id: string): Promise<Device> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const device = getMockDevices().find(d => d.id === id);
      if (!device) throw new Error('디바이스를 찾을 수 없습니다.');
      return device;
    }

    try {
      const response = await api.get<Device>(DEVICE_ENDPOINTS.GET(id));
      return response.data.data;
    } catch (error) {
      console.warn('API 호출 실패, 목업 데이터 사용:', error);
      const device = getMockDevices().find(d => d.id === id);
      if (!device) throw new Error('디바이스를 찾을 수 없습니다.');
      return device;
    }
  },

  /**
   * 디바이스 추가
   */
  async addDevice(data: AddDeviceRequest): Promise<Device> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // 새 디바이스 생성 (실제로는 캐시에 추가하지 않음, 다음 fetchDevices에서 로드됨)
      const newDevice: Device = {
        id: `device-${Date.now()}`,
        hostname: data.hostname,
        ip: data.ip,
        port: data.port,
        protocol: data.protocol,
        manufacturer: data.manufacturer || 'other',
        model: data.model || 'Unknown',
        firmwareVersion: '1.0.0',
        status: 'online',
        lastCommunication: Date.now(),
        location: data.location,
        description: data.description,
        groupId: data.groupId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return newDevice;
    }

    try {
      const response = await api.post<Device>(DEVICE_ENDPOINTS.CREATE, data);
      return response.data.data;
    } catch (error) {
      console.warn('API 호출 실패, 목업 응답 반환:', error);
      const newDevice: Device = {
        id: `device-${Date.now()}`,
        hostname: data.hostname,
        ip: data.ip,
        port: data.port,
        protocol: data.protocol,
        manufacturer: data.manufacturer || 'other',
        model: data.model || 'Unknown',
        firmwareVersion: '1.0.0',
        status: 'online',
        lastCommunication: Date.now(),
        location: data.location,
        description: data.description,
        groupId: data.groupId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return newDevice;
    }
  },

  /**
   * 디바이스 수정
   */
  async updateDevice(id: string, data: UpdateDeviceRequest): Promise<Device> {
    const response = await api.put<Device>(DEVICE_ENDPOINTS.UPDATE(id), data);
    return response.data.data;
  },

  /**
   * 디바이스 삭제
   */
  async deleteDevice(id: string): Promise<void> {
    await api.delete(DEVICE_ENDPOINTS.DELETE(id));
  },

  /**
   * 디바이스 연결 테스트
   */
  async testConnection(
    data: Omit<AddDeviceRequest, 'manufacturer' | 'model'>
  ): Promise<DeviceConnectionTest> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockConnectionTest;
    }

    try {
      const response = await api.post<DeviceConnectionTest>(
        `${DEVICE_ENDPOINTS.LIST}/test`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.warn('API 호출 실패, 목업 응답 반환:', error);
      return mockConnectionTest;
    }
  },

  /**
   * 디바이스 재시작
   */
  async rebootDevice(id: string): Promise<DeviceActionResult> {
    const response = await api.post<DeviceActionResult>(
      DEVICE_ENDPOINTS.REBOOT(id)
    );
    return response.data.data;
  },

  /**
   * 디바이스 구성 백업
   */
  async backupDevice(id: string, description?: string): Promise<BackupFile> {
    const response = await api.post<BackupFile>(DEVICE_ENDPOINTS.DEVICE_BACKUP(id), {
      description,
    });
    return response.data.data;
  },

  /**
   * 디바이스 구성 복원
   */
  async restoreDevice(id: string, backupId: string): Promise<DeviceActionResult> {
    const response = await api.post<DeviceActionResult>(
      DEVICE_ENDPOINTS.RESTORE(id),
      { backupId }
    );
    return response.data.data;
  },

  /**
   * 디바이스 펌웨어 업그레이드
   */
  async upgradeDevice(
    id: string,
    firmwareVersion: string,
    performBackup: boolean = true
  ): Promise<UpgradeProgress> {
    const response = await api.post<UpgradeProgress>(
      DEVICE_ENDPOINTS.UPGRADE(id),
      {
        firmwareVersion,
        performBackup,
      }
    );
    return response.data.data;
  },

  /**
   * 디바이스 업그레이드 진행 상태 조회
   */
  async getUpgradeProgress(id: string): Promise<UpgradeProgress> {
    const response = await api.get<UpgradeProgress>(
      `${DEVICE_ENDPOINTS.UPGRADE(id)}/progress`
    );
    return response.data.data;
  },

  /**
   * 디바이스 인터페이스 조회
   */
  async getDeviceInterfaces(id: string) {
    const response = await api.get(DEVICE_ENDPOINTS.INTERFACES(id));
    return response.data.data;
  },

  /**
   * 디바이스 통계 조회
   */
  async getDeviceStats(id: string) {
    const response = await api.get(DEVICE_ENDPOINTS.STATS(id));
    return response.data.data;
  },

  /**
   * 디바이스 로그 조회
   */
  async getDeviceLogs(
    id: string,
    limit: number = 100
  ): Promise<DeviceLog[]> {
    const response = await api.get<DeviceLog[]>(
      `${DEVICE_ENDPOINTS.LOGS(id)}?limit=${limit}`
    );
    return response.data.data;
  },

  /**
   * 일괄 작업 실행
   */
  async batchAction(data: BatchActionRequest): Promise<BatchActionResult> {
    const response = await api.post<BatchActionResult>(
      DEVICE_ENDPOINTS.BATCH_ACTION,
      data
    );
    return response.data.data;
  },

  /**
   * 디바이스 일괄 삭제
   */
  async batchDelete(deviceIds: string[]): Promise<void> {
    await api.post(DEVICE_ENDPOINTS.BATCH_DELETE, { deviceIds });
  },

  /**
   * 디바이스 그룹 목록 조회
   */
  async getGroups(): Promise<DeviceGroup[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockDeviceGroups;
    }

    try {
      const response = await api.get<DeviceGroup[]>(DEVICE_ENDPOINTS.GROUPS);
      return response.data.data;
    } catch (error) {
      console.warn('API 호출 실패, 목업 데이터 사용:', error);
      return mockDeviceGroups;
    }
  },

  /**
   * 디바이스 그룹 상세 조회
   */
  async getGroup(id: string): Promise<DeviceGroup> {
    const response = await api.get<DeviceGroup>(DEVICE_ENDPOINTS.GROUP(id));
    return response.data.data;
  },

  /**
   * 디바이스 그룹 생성
   */
  async createGroup(data: CreateGroupRequest): Promise<DeviceGroup> {
    const response = await api.post<DeviceGroup>(
      DEVICE_ENDPOINTS.GROUPS,
      data
    );
    return response.data.data;
  },

  /**
   * 디바이스 그룹 수정
   */
  async updateGroup(
    id: string,
    data: Partial<CreateGroupRequest>
  ): Promise<DeviceGroup> {
    const response = await api.put<DeviceGroup>(
      DEVICE_ENDPOINTS.GROUP(id),
      data
    );
    return response.data.data;
  },

  /**
   * 디바이스 그룹 삭제
   */
  async deleteGroup(id: string): Promise<void> {
    await api.delete(DEVICE_ENDPOINTS.GROUP(id));
  },

  /**
   * 디바이스를 그룹에 할당
   */
  async assignDeviceToGroup(deviceId: string, groupId: string): Promise<Device> {
    const response = await api.put<Device>(
      DEVICE_ENDPOINTS.ASSIGN_TO_GROUP(deviceId),
      { groupId }
    );
    return response.data.data;
  },

  /**
   * 그룹의 디바이스 목록 조회
   */
  async getGroupDevices(groupId: string): Promise<Device[]> {
    const response = await api.get<Device[]>(
      DEVICE_ENDPOINTS.GROUP_DEVICES(groupId)
    );
    return response.data.data;
  },

  /**
   * 사용 가능한 펌웨어 버전 목록 조회
   */
  async getFirmwareVersions(model?: string): Promise<FirmwareVersion[]> {
    const params = model ? `?model=${model}` : '';
    const response = await api.get<FirmwareVersion[]>(
      `${DEVICE_ENDPOINTS.FIRMWARE_VERSIONS}${params}`
    );
    return response.data.data;
  },

  /**
   * 특정 펌웨어 버전 정보 조회
   */
  async getFirmwareVersion(version: string): Promise<FirmwareVersion> {
    const response = await api.get<FirmwareVersion>(
      DEVICE_ENDPOINTS.FIRMWARE_VERSION(version)
    );
    return response.data.data;
  },

  /**
   * 디바이스 백업 목록 조회
   */
  async getDeviceBackups(deviceId: string): Promise<BackupFile[]> {
    const response = await api.get<BackupFile[]>(
      DEVICE_ENDPOINTS.DEVICE_BACKUPS(deviceId)
    );
    return response.data.data;
  },

  /**
   * 백업 파일 다운로드
   */
  async downloadBackup(backupId: string): Promise<Blob> {
    const response = await httpClient.get(DEVICE_ENDPOINTS.BACKUP(backupId), {
      responseType: 'blob',
    });
    return response.data as any as Blob;
  },

  /**
   * 백업 파일 삭제
   */
  async deleteBackup(backupId: string): Promise<void> {
    await api.delete(DEVICE_ENDPOINTS.BACKUP(backupId));
  },
};

export default deviceService;
