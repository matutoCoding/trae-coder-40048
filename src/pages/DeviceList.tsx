import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Factory,
  ChevronRight,
  MapPin,
  Calendar,
  Activity,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { ScrollTabs, SegmentedControl } from '../components/common/Tabs';
import { Input } from '../components/common/Form';
import { Empty, EmptySearch } from '../components/common/Empty';
import { classNames, formatDate, getDeviceStatusText, getDeviceStatusColor } from '../utils';
import type { DeviceStatus } from '../types';

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'running', label: '运行中' },
  { key: 'standby', label: '待机' },
  { key: 'maintenance', label: '保养中' },
  { key: 'fault', label: '故障' },
  { key: 'offline', label: '离线' },
];

export const DeviceList: React.FC = () => {
  const navigate = useNavigate();
  const { devices } = useAppStore();
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredDevices = useMemo(() => {
    let result = [...devices];

    if (activeTab !== 'all') {
      result = result.filter((d) => d.status === activeTab);
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(keyword) ||
          d.deviceNo.toLowerCase().includes(keyword) ||
          d.model.toLowerCase().includes(keyword) ||
          d.location.toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [devices, activeTab, searchKeyword]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: devices.length };
    devices.forEach((d) => {
      counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return counts;
  }, [devices]);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <Header title="设备台账" />

      <div className="px-4 py-4 space-y-4">
        <div className="relative">
          <Input
            value={searchKeyword}
            onChange={setSearchKeyword}
            placeholder="搜索设备名称、编号、型号..."
            className="pl-10"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
        </div>

        <div className="flex items-center justify-between">
          <ScrollTabs
            items={statusTabs.map((t) => ({
              ...t,
              badge: statusCounts[t.key] || 0,
            }))}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
          <SegmentedControl
            options={[
              { key: 'list', label: '列表' },
              { key: 'grid', label: '卡片' },
            ]}
            value={viewMode}
            onChange={(v) => setViewMode(v as 'list' | 'grid')}
            className="ml-3 w-24 flex-shrink-0"
          />
        </div>

        {filteredDevices.length === 0 ? (
          searchKeyword ? (
            <EmptySearch keyword={searchKeyword} />
          ) : (
            <Empty title="暂无设备" description="该分类下暂无设备" />
          )
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredDevices.map((device, index) => (
              <Card
                key={device.id}
                onClick={() => navigate(`/devices/${device.id}`)}
                className="cursor-pointer active:scale-[0.99] animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div
                      className={classNames(
                        'w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0',
                        getDeviceStatusColor(device.status).bg
                      )}
                    >
                      <Factory
                        size={24}
                        className={getDeviceStatusColor(device.status).text}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <h3 className="font-bold text-neutral-700 truncate">
                            {device.name}
                          </h3>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {device.deviceNo} · {device.model}
                          </p>
                        </div>
                        <StatusBadge status={device.status} />
                      </div>
                      <div className="flex items-center mt-3 space-x-4 text-xs text-neutral-500">
                        <span className="flex items-center">
                          <MapPin size={12} className="mr-1" />
                          {device.location}
                        </span>
                        <span className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(device.installDate, 'YYYY-MM-DD')}
                        </span>
                        <span className="flex items-center">
                          <Activity size={12} className="mr-1" />
                          {device.runHours !== undefined && device.runHours !== null ? `${device.runHours}h` : '--h'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-neutral-300 ml-2 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredDevices.map((device, index) => (
              <Card
                key={device.id}
                onClick={() => navigate(`/devices/${device.id}`)}
                className="cursor-pointer active:scale-[0.99] animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className={classNames(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        getDeviceStatusColor(device.status).bg
                      )}
                    >
                      <Factory
                        size={20}
                        className={getDeviceStatusColor(device.status).text}
                      />
                    </div>
                    <StatusBadge status={device.status} size="sm" />
                  </div>
                  <h3 className="font-bold text-neutral-700 text-sm truncate">
                    {device.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 truncate">
                    {device.deviceNo}
                  </p>
                  <p className="text-xs text-neutral-400 mt-2 truncate">
                    {device.location}
                  </p>
                  <p className="text-xs text-primary-500 mt-2">
                    运行 {device.runHours !== undefined && device.runHours !== null ? `${device.runHours}h` : '--h'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="devices" />
    </div>
  );
};
