import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Factory,
  FileText,
  Camera,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { Header } from '../components/layout/Header';
import { Empty } from '../components/common/Empty';
import { classNames, formatDate } from '../utils';

export const InspectionRecordDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { inspectionRecords, devices } = useAppStore();

  const record = useMemo(
    () => inspectionRecords.find((r) => r.id === id),
    [inspectionRecords, id]
  );

  const device = useMemo(
    () => devices.find((d) => d.id === record?.deviceId),
    [devices, record]
  );

  const detailItems = useMemo(() => {
    if (!record) return [];
    return (record.results || record.items || []) as any[];
  }, [record]);

  const stats = useMemo(() => {
    let normal = 0;
    let abnormal = 0;
    let skipped = 0;

    detailItems.forEach((item: any) => {
      const status = item?.status;
      if (status === 'normal' || status === 'completed') {
        normal++;
      } else if (status === 'abnormal') {
        abnormal++;
      } else if (status === 'skipped') {
        skipped++;
      }
    });

    return {
      normal,
      abnormal,
      skipped,
      total: detailItems.length,
    };
  }, [detailItems]);

  const sortedItems = useMemo(() => {
    const abnormalItems: any[] = [];
    const normalItems: any[] = [];
    const skippedItems: any[] = [];

    detailItems.forEach((item: any) => {
      const status = item?.status;
      if (status === 'abnormal') {
        abnormalItems.push(item);
      } else if (status === 'normal' || status === 'completed') {
        normalItems.push(item);
      } else if (status === 'skipped') {
        skippedItems.push(item);
      } else {
        normalItems.push(item);
      }
    });

    return [...abnormalItems, ...normalItems, ...skippedItems];
  }, [detailItems]);

  const inspectorName = record?.inspectorName || record?.executorName || '点检员';
  const inspectionType = record?.inspectionType || '日常';
  const inspectionTime =
    record?.inspectionTime ||
    (record as any)?.inspectedAt ||
    (record as any)?.createdAt ||
    (record as any)?.startTime ||
    '';
  const overallRemark = record?.remark || record?.remarks || '';

  const getStatusText = (status: string): string => {
    const map: Record<string, string> = {
      normal: '正常',
      abnormal: '异常',
      skipped: '跳过',
      completed: '正常',
      pending: '待处理',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const map: Record<string, string> = {
      normal: 'text-success-600 bg-success-100',
      abnormal: 'text-danger-600 bg-danger-100',
      skipped: 'text-warning-600 bg-warning-100',
      completed: 'text-success-600 bg-success-100',
      pending: 'text-neutral-500 bg-neutral-100',
    };
    return map[status] || 'text-neutral-500 bg-neutral-100';
  };

  const getItemName = (item: any): string => {
    return item?.name || item?.itemName || item?.itemId || '未知项';
  };

  const getItemValue = (item: any): string => {
    const value = item?.value;
    const unit = item?.unit || '';
    if (value === undefined || value === null || value === '') return '';
    return unit ? `${value}${unit}` : String(value);
  };

  if (!record) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Empty title="记录不存在" description="该点检记录可能已被删除" />
      </div>
    );
  }

  const getRecordStatusBadge = () => {
    if (stats.abnormal > 0) {
      return <StatusBadge status="abnormal" variant="light" />;
    }
    if (stats.skipped > 0) {
      return <StatusBadge status="partial" variant="light" />;
    }
    return <StatusBadge status="normal" variant="light" />;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="点检详情" showBack />

      <div className="px-4 py-4 pt-16 space-y-4">
        <div
          className={classNames(
            'rounded-2xl p-5 text-white shadow-lg',
            stats.abnormal > 0
              ? 'bg-gradient-to-r from-danger-500 to-danger-600'
              : stats.skipped > 0
              ? 'bg-gradient-to-r from-warning-500 to-warning-600'
              : 'bg-gradient-to-r from-success-500 to-success-600'
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <ClipboardList size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold">{record.deviceName}</h1>
                <p className="text-white/80 text-sm mt-0.5">{record.deviceNo}</p>
              </div>
            </div>
            {getRecordStatusBadge()}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-white/90">
              <User size={14} className="mr-1.5" />
              <span>{inspectorName}</span>
            </div>
            <div className="flex items-center text-white/90">
              <Clock size={14} className="mr-1.5" />
              <span>{inspectionTime ? formatDate(inspectionTime, 'MM-DD HH:mm') : '--'}</span>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <FileText size={18} className="mr-2 text-primary-500" />
              基本信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 text-neutral-500">
                  <Factory size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-neutral-400">设备编号</p>
                  <p className="text-sm text-neutral-700 font-medium truncate">
                    {record.deviceNo || '--'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 text-neutral-500">
                  <ClipboardList size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-neutral-400">点检类型</p>
                  <p className="text-sm text-neutral-700 font-medium truncate">
                    {inspectionType}点检
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 text-neutral-500">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-neutral-400">点检人</p>
                  <p className="text-sm text-neutral-700 font-medium truncate">
                    {inspectorName}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 text-neutral-500">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-neutral-400">点检时间</p>
                  <p className="text-sm text-neutral-700 font-medium truncate">
                    {inspectionTime ? formatDate(inspectionTime, 'YYYY-MM-DD HH:mm') : '--'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <ClipboardList size={18} className="mr-2 text-primary-500" />
              统计概览
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-3 bg-success-50 rounded-xl">
                <p className="text-2xl font-bold text-success-600">{stats.normal}</p>
                <p className="text-xs text-neutral-500 mt-1">正常</p>
              </div>
              <div className="text-center p-3 bg-danger-50 rounded-xl">
                <p className="text-2xl font-bold text-danger-600">{stats.abnormal}</p>
                <p className="text-xs text-neutral-500 mt-1">异常</p>
              </div>
              <div className="text-center p-3 bg-warning-50 rounded-xl">
                <p className="text-2xl font-bold text-warning-600">{stats.skipped}</p>
                <p className="text-xs text-neutral-500 mt-1">跳过</p>
              </div>
              <div className="text-center p-3 bg-neutral-100 rounded-xl">
                <p className="text-2xl font-bold text-neutral-600">{stats.total}</p>
                <p className="text-xs text-neutral-500 mt-1">总数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <ClipboardList size={18} className="mr-2 text-primary-500" />
              点检项列表
            </h3>
            <div className="space-y-3">
              {sortedItems.length > 0 ? (
                sortedItems.map((item: any, index: number) => {
                  const status = item?.status || 'normal';
                  const isAbnormal = status === 'abnormal';
                  const isSkipped = status === 'skipped';
                  const valueText = getItemValue(item);
                  const itemName = getItemName(item);
                  const remark = item?.remark || '';
                  const images = item?.images || [];

                  return (
                    <div
                      key={item?.itemId || item?.id || index}
                      className={classNames(
                        'p-3 rounded-xl transition-all',
                        isAbnormal
                          ? 'bg-danger-50 border border-danger-200'
                          : 'bg-neutral-50'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-neutral-700 text-sm">
                            {itemName}
                          </h4>
                          {valueText && (
                            <p className="text-sm text-neutral-600 mt-1">
                              检测值：<span className="font-medium">{valueText}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <span
                            className={classNames(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                              getStatusColor(status)
                            )}
                          >
                            {isAbnormal ? (
                              <XCircle size={12} className="mr-1" />
                            ) : isSkipped ? (
                              <AlertTriangle size={12} className="mr-1" />
                            ) : (
                              <CheckCircle2 size={12} className="mr-1" />
                            )}
                            {getStatusText(status)}
                          </span>
                        </div>
                      </div>

                      {remark && (
                        <div className="mt-2 text-xs text-neutral-500">
                          <span className="text-neutral-400">备注：</span>
                          {remark}
                        </div>
                      )}

                      {images.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {images.map((img: string, imgIndex: number) => (
                            <div
                              key={imgIndex}
                              className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden"
                            >
                              <Camera size={20} className="text-neutral-400" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-neutral-400 text-sm">
                  暂无点检项
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {overallRemark && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-neutral-700 mb-3 flex items-center">
                <FileText size={18} className="mr-2 text-primary-500" />
                总体备注
              </h3>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <p className="text-sm text-neutral-600">{overallRemark}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {device && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-neutral-700 mb-3 flex items-center">
                <Factory size={18} className="mr-2 text-primary-500" />
                关联设备
              </h3>
              <div
                onClick={() => navigate(`/devices/${device.id}`)}
                className="flex items-center p-3 bg-neutral-50 rounded-xl cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <Factory size={20} className="text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-700">{device.name}</p>
                  <p className="text-xs text-neutral-500">
                    {device.deviceNo} · {device.model}
                  </p>
                </div>
                <ChevronRight size={16} className="text-neutral-300" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="pb-4" />
      </div>
    </div>
  );
};
