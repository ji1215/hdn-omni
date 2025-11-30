import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import deviceService from '@/services/deviceService';
import type {
  Device,
  DeviceGroup,
  DeviceFilter,
  DeviceSort,
  AddDeviceRequest,
  UpdateDeviceRequest,
  CreateGroupRequest,
} from '@/types/device';

interface DeviceState {
  // 디바이스 목록 상태
  devices: Device[];
  selectedDevices: Set<string>;
  loading: boolean;
  error: string | null;

  // 페이지네이션 상태
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;

  // 필터 상태
  filter: DeviceFilter;

  // 정렬 상태
  sort: DeviceSort;

  // 그룹 상태
  deviceGroups: DeviceGroup[];
  selectedGroupId: string | null;

  // 디바이스 액션
  fetchDevices: () => Promise<void>;
  fetchDevice: (id: string) => Promise<Device | null>;
  addDevice: (data: AddDeviceRequest) => Promise<Device | null>;
  updateDevice: (id: string, data: UpdateDeviceRequest) => Promise<Device | null>;
  deleteDevice: (id: string) => Promise<boolean>;

  // 페이지네이션 액션
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // 필터 액션
  setFilter: (filter: Partial<DeviceFilter>) => void;
  clearFilter: () => void;

  // 정렬 액션
  setSort: (sort: DeviceSort) => void;

  // 선택 액션
  toggleDeviceSelection: (id: string) => void;
  selectAllDevices: () => void;
  clearSelection: () => void;
  isDeviceSelected: (id: string) => boolean;

  // 그룹 액션
  fetchGroups: () => Promise<void>;
  createGroup: (data: CreateGroupRequest) => Promise<DeviceGroup | null>;
  updateGroup: (id: string, data: Partial<CreateGroupRequest>) => Promise<DeviceGroup | null>;
  deleteGroup: (id: string) => Promise<boolean>;
  selectGroup: (groupId: string | null) => void;
  assignDeviceToGroup: (deviceId: string, groupId: string) => Promise<boolean>;

  // 디바이스 작업 액션
  rebootDevice: (id: string) => Promise<boolean>;
  backupDevice: (id: string, description?: string) => Promise<boolean>;
  upgradeDevice: (id: string, firmwareVersion: string, performBackup?: boolean) => Promise<boolean>;

  // 일괄 작업 액션
  batchReboot: (deviceIds: string[]) => Promise<{ success: number; failed: number }>;
  batchBackup: (deviceIds: string[]) => Promise<{ success: number; failed: number }>;
  batchDelete: (deviceIds: string[]) => Promise<boolean>;

  // 유틸리티 액션
  reset: () => void;
}

const initialFilter: DeviceFilter = {
  statuses: undefined,
  manufacturers: undefined,
  ipRange: undefined,
  searchQuery: undefined,
  groupId: undefined,
};

const initialSort: DeviceSort = {
  field: 'hostname',
  order: 'asc',
};

const useDeviceStore = create<DeviceState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 초기 상태
        devices: [],
        selectedDevices: new Set<string>(),
        loading: false,
        error: null,

        currentPage: 1,
        pageSize: 25,
        totalItems: 0,
        totalPages: 0,

        filter: initialFilter,
        sort: initialSort,

        deviceGroups: [],
        selectedGroupId: null,

        // 디바이스 목록 조회
        fetchDevices: async () => {
          set({ loading: true, error: null });
          try {
            const state = get();
            const response = await deviceService.getDevices({
              page: state.currentPage,
              pageSize: state.pageSize,
              filter: state.filter,
              sort: state.sort,
            });

            set({
              devices: response.devices,
              totalItems: response.total,
              totalPages: response.totalPages,
              loading: false,
            });
          } catch (error: any) {
            set({
              error: error.message || '디바이스 목록을 불러오는데 실패했습니다.',
              loading: false,
            });
          }
        },

        // 디바이스 상세 조회
        fetchDevice: async (id: string) => {
          try {
            const device = await deviceService.getDevice(id);
            return device;
          } catch (error: any) {
            set({ error: error.message || '디바이스 정보를 불러오는데 실패했습니다.' });
            return null;
          }
        },

        // 디바이스 추가
        addDevice: async (data: AddDeviceRequest) => {
          set({ loading: true, error: null });
          try {
            const device = await deviceService.addDevice(data);
            await get().fetchDevices(); // 목록 새로고침
            set({ loading: false });
            return device;
          } catch (error: any) {
            set({
              error: error.message || '디바이스 추가에 실패했습니다.',
              loading: false,
            });
            return null;
          }
        },

        // 디바이스 수정
        updateDevice: async (id: string, data: UpdateDeviceRequest) => {
          set({ loading: true, error: null });
          try {
            const device = await deviceService.updateDevice(id, data);
            await get().fetchDevices(); // 목록 새로고침
            set({ loading: false });
            return device;
          } catch (error: any) {
            set({
              error: error.message || '디바이스 수정에 실패했습니다.',
              loading: false,
            });
            return null;
          }
        },

        // 디바이스 삭제
        deleteDevice: async (id: string) => {
          set({ loading: true, error: null });
          try {
            await deviceService.deleteDevice(id);
            await get().fetchDevices(); // 목록 새로고침
            set({ loading: false });
            return true;
          } catch (error: any) {
            set({
              error: error.message || '디바이스 삭제에 실패했습니다.',
              loading: false,
            });
            return false;
          }
        },

        // 페이지 설정
        setPage: (page: number) => {
          set({ currentPage: page });
          get().fetchDevices();
        },

        // 페이지 크기 설정
        setPageSize: (pageSize: number) => {
          set({ pageSize, currentPage: 1 });
          get().fetchDevices();
        },

        // 필터 설정
        setFilter: (newFilter: Partial<DeviceFilter>) => {
          set((state) => {
            state.filter = { ...state.filter, ...newFilter };
            state.currentPage = 1;
          });
          get().fetchDevices();
        },

        // 필터 초기화
        clearFilter: () => {
          set({ filter: initialFilter, currentPage: 1 });
          get().fetchDevices();
        },

        // 정렬 설정
        setSort: (sort: DeviceSort) => {
          set({ sort });
          get().fetchDevices();
        },

        // 디바이스 선택 토글
        toggleDeviceSelection: (id: string) => {
          set((state) => {
            if (state.selectedDevices.has(id)) {
              state.selectedDevices.delete(id);
            } else {
              state.selectedDevices.add(id);
            }
          });
        },

        // 모든 디바이스 선택
        selectAllDevices: () => {
          set((state) => {
            state.selectedDevices = new Set(state.devices.map((d) => d.id));
          });
        },

        // 선택 해제
        clearSelection: () => {
          set({ selectedDevices: new Set<string>() });
        },

        // 디바이스 선택 여부 확인
        isDeviceSelected: (id: string) => {
          return get().selectedDevices.has(id);
        },

        // 그룹 목록 조회
        fetchGroups: async () => {
          try {
            const groups = await deviceService.getGroups();
            set({ deviceGroups: groups });
          } catch (error: any) {
            set({ error: error.message || '그룹 목록을 불러오는데 실패했습니다.' });
          }
        },

        // 그룹 생성
        createGroup: async (data: CreateGroupRequest) => {
          try {
            const group = await deviceService.createGroup(data);
            await get().fetchGroups(); // 그룹 목록 새로고침
            return group;
          } catch (error: any) {
            set({ error: error.message || '그룹 생성에 실패했습니다.' });
            return null;
          }
        },

        // 그룹 수정
        updateGroup: async (id: string, data: Partial<CreateGroupRequest>) => {
          try {
            const group = await deviceService.updateGroup(id, data);
            await get().fetchGroups(); // 그룹 목록 새로고침
            return group;
          } catch (error: any) {
            set({ error: error.message || '그룹 수정에 실패했습니다.' });
            return null;
          }
        },

        // 그룹 삭제
        deleteGroup: async (id: string) => {
          try {
            await deviceService.deleteGroup(id);
            await get().fetchGroups(); // 그룹 목록 새로고침

            // 선택된 그룹이 삭제된 경우 선택 해제
            if (get().selectedGroupId === id) {
              set({ selectedGroupId: null });
            }

            return true;
          } catch (error: any) {
            set({ error: error.message || '그룹 삭제에 실패했습니다.' });
            return false;
          }
        },

        // 그룹 선택
        selectGroup: (groupId: string | null) => {
          set({
            selectedGroupId: groupId,
            currentPage: 1,
          });

          // 필터에 그룹 ID 설정
          if (groupId) {
            get().setFilter({ groupId });
          } else {
            get().setFilter({ groupId: undefined });
          }
        },

        // 디바이스를 그룹에 할당
        assignDeviceToGroup: async (deviceId: string, groupId: string) => {
          try {
            await deviceService.assignDeviceToGroup(deviceId, groupId);
            await get().fetchDevices(); // 목록 새로고침
            await get().fetchGroups(); // 그룹 목록 새로고침 (디바이스 수 업데이트)
            return true;
          } catch (error: any) {
            set({ error: error.message || '그룹 할당에 실패했습니다.' });
            return false;
          }
        },

        // 디바이스 재시작
        rebootDevice: async (id: string) => {
          try {
            await deviceService.rebootDevice(id);
            return true;
          } catch (error: any) {
            set({ error: error.message || '디바이스 재시작에 실패했습니다.' });
            return false;
          }
        },

        // 디바이스 백업
        backupDevice: async (id: string, description?: string) => {
          try {
            await deviceService.backupDevice(id, description);
            return true;
          } catch (error: any) {
            set({ error: error.message || '디바이스 백업에 실패했습니다.' });
            return false;
          }
        },

        // 디바이스 펌웨어 업그레이드
        upgradeDevice: async (id: string, firmwareVersion: string, performBackup = true) => {
          try {
            await deviceService.upgradeDevice(id, firmwareVersion, performBackup);
            return true;
          } catch (error: any) {
            set({ error: error.message || '펌웨어 업그레이드에 실패했습니다.' });
            return false;
          }
        },

        // 일괄 재시작
        batchReboot: async (deviceIds: string[]) => {
          try {
            const result = await deviceService.batchAction({
              deviceIds,
              action: 'reboot',
            });

            return {
              success: result.successCount,
              failed: result.failureCount,
            };
          } catch (error: any) {
            set({ error: error.message || '일괄 재시작에 실패했습니다.' });
            return { success: 0, failed: deviceIds.length };
          }
        },

        // 일괄 백업
        batchBackup: async (deviceIds: string[]) => {
          try {
            const result = await deviceService.batchAction({
              deviceIds,
              action: 'backup',
            });

            return {
              success: result.successCount,
              failed: result.failureCount,
            };
          } catch (error: any) {
            set({ error: error.message || '일괄 백업에 실패했습니다.' });
            return { success: 0, failed: deviceIds.length };
          }
        },

        // 일괄 삭제
        batchDelete: async (deviceIds: string[]) => {
          set({ loading: true, error: null });
          try {
            await deviceService.batchDelete(deviceIds);
            await get().fetchDevices(); // 목록 새로고침
            get().clearSelection(); // 선택 해제
            set({ loading: false });
            return true;
          } catch (error: any) {
            set({
              error: error.message || '일괄 삭제에 실패했습니다.',
              loading: false,
            });
            return false;
          }
        },

        // 상태 초기화
        reset: () => {
          set({
            devices: [],
            selectedDevices: new Set<string>(),
            loading: false,
            error: null,
            currentPage: 1,
            pageSize: 25,
            totalItems: 0,
            totalPages: 0,
            filter: initialFilter,
            sort: initialSort,
            deviceGroups: [],
            selectedGroupId: null,
          });
        },
      })),
      {
        name: 'device-storage',
        partialize: (state) => ({
          pageSize: state.pageSize,
          filter: state.filter,
          sort: state.sort,
        }),
      }
    )
  )
);

export default useDeviceStore;
