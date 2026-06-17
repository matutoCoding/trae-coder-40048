import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Factory,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Camera,
  Droplets,
  Gauge,
  Thermometer,
  Cog,
  Eye,
  MapPin,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { Input, Slider, ImageUpload, RadioGroup } from '../components/common/Form';
import { Empty, LoadingOverlay } from '../components/common/Empty';
import { classNames, formatDate, generateId } from '../utils';
import type { InspectionItemResult, InspectionItem } from '../types';

export const InspectionExecute: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { devices, inspectionItems, addInspectionRecord, user, updateDeviceStatus } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Map<string, InspectionItemResult>>(new Map());
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const device = useMemo(() => devices.find((d) => d.id === deviceId), [devices, deviceId]);
  const items = useMemo(() => {
    if (!device) return [];
    return inspectionItems.filter((item) => {
      if (item.deviceId === device.id) return true;
      if (!item.applicableModels || item.applicableModels.length === 0) return true;
      if (item.applicableModels.includes('all')) return true;
      if (device.model && item.applicableModels.includes(device.model)) return true;
      return false;
    });
  }, [device, inspectionItems]);

  const currentItem = items[currentIndex];

  const handleResultChange = (itemId: string, result: Partial<InspectionItemResult>) => {
    setResults((prev) => {
      const next = new Map(prev);
      const existing = next.get(itemId) || {
        itemId,
        status: 'normal',
        value: '',
        remark: '',
        images: [],
      };
      next.set(itemId, { ...existing, ...result });
      return next;
    });
  };

  const handleStatusChange = (status: 'normal' | 'abnormal' | 'skipped') => {
    if (!currentItem) return;
    handleResultChange(currentItem.id, { status });
  };

  const handleValueChange = (value: string) => {
    if (!currentItem) return;
    handleResultChange(currentItem.id, { value });
    if (currentItem.dataType === 'number' && currentItem.normalRange) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const [min, max] = currentItem.normalRange.split('-').map(Number);
        const isNormal = numValue >= min && numValue <= max;
        handleResultChange(currentItem.id, { status: isNormal ? 'normal' : 'abnormal' });
      }
    }
  };

  const handleSliderChange = (value: number) => {
    if (!currentItem) return;
    handleResultChange(currentItem.id, { value: String(value) });
    if (currentItem.dataType === 'percentage' && currentItem.normalRange) {
      const [min, max] = currentItem.normalRange.split('-').map(Number);
      const isNormal = value >= min && value <= max;
      handleResultChange(currentItem.id, { status: isNormal ? 'normal' : 'abnormal' });
    }
  };

  const handleImagesChange = (images: string[]) => {
    if (!currentItem) return;
    handleResultChange(currentItem.id, { images });
  };

  const handleRemarkChange = (remark: string) => {
    if (!currentItem) return;
    handleResultChange(currentItem.id, { remark });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle2 size={20} className="text-success-500" />;
      case 'abnormal':
        return <XCircle size={20} className="text-danger-500" />;
      case 'skipped':
        return <AlertTriangle size={20} className="text-warning-500" />;
      default:
        return <Eye size={20} className="text-neutral-400" />;
    }
  };

  const getItemIcon = (item: InspectionItem) => {
    switch (item.category) {
      case 'lubrication':
        return <Droplets size={20} />;
      case 'hydraulic':
        return <Gauge size={20} />;
      case 'electrical':
        return <Cog size={20} />;
      case 'mechanical':
        return <Cog size={20} />;
      case 'temperature':
        return <Thermometer size={20} />;
      case 'appearance':
        return <Eye size={20} />;
      default:
        return <Cog size={20} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lubrication':
        return 'bg-blue-100 text-blue-600';
      case 'hydraulic':
        return 'bg-cyan-100 text-cyan-600';
      case 'electrical':
        return 'bg-yellow-100 text-yellow-600';
      case 'mechanical':
        return 'bg-purple-100 text-purple-600';
      case 'temperature':
        return 'bg-red-100 text-red-600';
      case 'appearance':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  const progress = useMemo(() => {
    return (results.size / items.length) * 100;
  }, [results.size, items.length]);

  const completionStats = useMemo(() => {
    const values = Array.from(results.values());
    return {
      completed: results.size,
      total: items.length,
      normal: values.filter((v) => v.status === 'normal').length,
      abnormal: values.filter((v) => v.status === 'abnormal').length,
      skipped: values.filter((v) => v.status === 'skipped').length,
    };
  }, [results, items.length]);

  const handleSubmit = async () => {
    if (!device || !user) return;

    setIsSubmitting(true);

    try {
      const resultArray = Array.from(results.values());
      const abnormalCount = resultArray.filter((r) => r.status === 'abnormal').length;

      await addInspectionRecord({
        id: generateId('record'),
        deviceId: device.id,
        deviceName: device.name,
        deviceNo: device.deviceNo,
        inspectionPlanId: 'plan-manual',
        inspectionType: '日常',
        inspectorId: user.id,
        inspectorName: user.realName,
        inspectionTime: new Date().toISOString(),
        status: abnormalCount > 0 ? 'completed_with_issues' : 'completed',
        results: resultArray,
        abnormalCount,
        remark,
        location: device.location,
        images: resultArray.flatMap((r) => r.images),
      });

      if (abnormalCount > 0) {
        updateDeviceStatus(device.id, 'maintenance');
      }

      navigate('/inspection-complete', {
        state: {
          deviceName: device.name,
          stats: completionStats,
          abnormalCount,
        },
      });
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!device) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Empty title="设备不存在" description="该设备可能已被删除" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Empty
          icon={<AlertCircle size={32} className="text-neutral-300" />}
          title="暂无点检项"
          description="该设备暂无配置点检项"
          action={{
            label: '返回',
            onClick: () => navigate(-1),
          }}
        />
      </div>
    );
  }

  const currentResult = results.get(currentItem?.id || '');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header
        title="执行点检"
        rightAction={
          <button
            onClick={() => setShowConfirm(true)}
            className="text-white/90 text-sm flex items-center"
          >
            <Send size={16} className="mr-1" />
            提交
          </button>
        }
      />

      <div className="bg-primary-500 text-white px-4 py-3">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
            <Factory size={20} />
          </div>
          <div>
            <h2 className="font-bold">{device.name}</h2>
            <p className="text-white/80 text-xs">{device.deviceNo}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center">
            <MapPin size={12} className="mr-1" />
            {device.location}
          </span>
          <span className="flex items-center">
            <Clock size={12} className="mr-1" />
            {formatDate(new Date(), 'HH:mm')}
          </span>
        </div>
      </div>

      <div className="bg-white px-4 py-3 border-b border-neutral-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600">
            点检进度：{completionStats.completed}/{completionStats.total}
          </span>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-success-600 flex items-center">
              <CheckCircle2 size={12} className="mr-0.5" />
              {completionStats.normal}
            </span>
            <span className="text-danger-600 flex items-center">
              <XCircle size={12} className="mr-0.5" />
              {completionStats.abnormal}
            </span>
            <span className="text-warning-600 flex items-center">
              <AlertTriangle size={12} className="mr-0.5" />
              {completionStats.skipped}
            </span>
          </div>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-4 py-4">
        {currentItem && (
          <div key={currentItem.id} className="animate-fade-in">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <div
                      className={classNames(
                        'w-12 h-12 rounded-xl flex items-center justify-center mr-4',
                        getCategoryColor(currentItem.category)
                      )}
                    >
                      {getItemIcon(currentItem)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span
                          className={classNames(
                            'text-xs px-2 py-0.5 rounded-full mr-2',
                            getCategoryColor(currentItem.category)
                          )}
                        >
                          {currentItem.categoryName}
                        </span>
                        {currentItem.isKey && (
                          <span className="text-xs bg-danger-100 text-danger-600 px-2 py-0.5 rounded-full">
                            关键项
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-neutral-700 mt-2 text-lg">
                        {currentItem.name}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        {currentItem.description}
                      </p>
                    </div>
                    {currentResult && getStatusIcon(currentResult.status)}
                  </div>
                </div>

                {currentItem.normalRange && (
                  <div className="bg-neutral-50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-neutral-500">标准范围</p>
                    <p className="font-medium text-neutral-700">
                      {currentItem.normalRange}
                      {currentItem.unit && ` ${currentItem.unit}`}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {currentItem.dataType === 'number' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        检测值 {currentItem.unit && `(${currentItem.unit})`}
                      </label>
                      <Input
                        type="number"
                        value={String(currentResult?.value || '')}
                        onChange={handleValueChange}
                        placeholder={`请输入检测值，标准：${currentItem.normalRange || '无'}`}
                        className={classNames(
                          currentResult?.status === 'abnormal' &&
                            'border-danger-500 focus:border-danger-500'
                        )}
                      />
                    </div>
                  )}

                  {currentItem.dataType === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        {currentItem.name}
                      </label>
                      <div className="text-center mb-2">
                        <span className="text-3xl font-bold text-primary-500">
                          {currentResult?.value || '0'}%
                        </span>
                      </div>
                      <Slider
                        value={parseFloat(String(currentResult?.value || '0')) || 0}
                        onChange={handleSliderChange}
                        min={0}
                        max={100}
                        unit="%"
                      />
                    </div>
                  )}

                  {currentItem.dataType === 'options' && currentItem.options && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        检测结果
                      </label>
                      <RadioGroup
                        options={currentItem.options.map((opt) => ({
                          label: opt.label,
                          value: opt.value,
                        }))}
                        value={String(currentResult?.value || '')}
                        onChange={(v) => {
                          handleValueChange(v);
                          const isNormal = v === '正常' || v === '良好' || v === '合格';
                          handleResultChange(currentItem.id, {
                            status: isNormal ? 'normal' : 'abnormal',
                          });
                        }}
                      />
                    </div>
                  )}

                  {currentItem.dataType === 'boolean' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        检测结果
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            handleResultChange(currentItem.id, {
                              status: 'normal',
                              value: '正常',
                            });
                          }}
                          className={classNames(
                            'py-3 rounded-xl font-medium transition-all flex items-center justify-center',
                            currentResult?.status === 'normal'
                              ? 'bg-success-500 text-white'
                              : 'bg-neutral-100 text-neutral-600'
                          )}
                        >
                          <CheckCircle2 size={18} className="mr-2" />
                          正常
                        </button>
                        <button
                          onClick={() => {
                            handleResultChange(currentItem.id, {
                              status: 'abnormal',
                              value: '异常',
                            });
                          }}
                          className={classNames(
                            'py-3 rounded-xl font-medium transition-all flex items-center justify-center',
                            currentResult?.status === 'abnormal'
                              ? 'bg-danger-500 text-white'
                              : 'bg-neutral-100 text-neutral-600'
                          )}
                        >
                          <XCircle size={18} className="mr-2" />
                          异常
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      快速标记
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleStatusChange('normal')}
                        className={classNames(
                          'py-2 rounded-lg text-xs font-medium transition-all',
                          currentResult?.status === 'normal'
                            ? 'bg-success-500 text-white'
                            : 'bg-success-50 text-success-600'
                        )}
                      >
                        <CheckCircle2 size={14} className="inline mr-1" />
                        正常
                      </button>
                      <button
                        onClick={() => handleStatusChange('abnormal')}
                        className={classNames(
                          'py-2 rounded-lg text-xs font-medium transition-all',
                          currentResult?.status === 'abnormal'
                            ? 'bg-danger-500 text-white'
                            : 'bg-danger-50 text-danger-600'
                        )}
                      >
                        <XCircle size={14} className="inline mr-1" />
                        异常
                      </button>
                      <button
                        onClick={() => handleStatusChange('skipped')}
                        className={classNames(
                          'py-2 rounded-lg text-xs font-medium transition-all',
                          currentResult?.status === 'skipped'
                            ? 'bg-warning-500 text-white'
                            : 'bg-warning-50 text-warning-600'
                        )}
                      >
                        <AlertTriangle size={14} className="inline mr-1" />
                        跳过
                      </button>
                    </div>
                  </div>

                  {currentItem.requireImage && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <Camera size={14} className="inline mr-1" />
                        现场照片 {currentItem.requireImage && <span className="text-danger-500">*</span>}
                      </label>
                      <ImageUpload
                        value={currentResult?.images || []}
                        onChange={handleImagesChange}
                        maxCount={5}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      备注说明
                    </label>
                    <Input
                      type="textarea"
                      value={currentResult?.remark || ''}
                      onChange={handleRemarkChange}
                      placeholder="请输入备注说明（选填）"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="flex-1 mr-2"
          >
            <ChevronLeft size={16} className="mr-1" />
            上一项
          </Button>
          <div className="px-4">
            <span className="text-sm font-medium text-neutral-600">
              {currentIndex + 1}/{items.length}
            </span>
          </div>
          {currentIndex < items.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentIndex((i) => Math.min(items.length - 1, i + 1))}
              className="flex-1 ml-2"
            >
              下一项
              <ChevronRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={() => setShowConfirm(true)}
              className="flex-1 ml-2"
              disabled={results.size < items.length}
            >
              <Send size={16} className="mr-1" />
              完成点检
            </Button>
          )}
        </div>

        <Card className="mt-4">
          <CardContent className="p-4">
            <h4 className="font-medium text-neutral-700 mb-3">点检项导航</h4>
            <div className="grid grid-cols-6 gap-2">
              {items.map((item, index) => {
                const result = results.get(item.id);
                const isActive = index === currentIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(index)}
                    className={classNames(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary-500 text-white'
                        : result
                        ? result.status === 'normal'
                          ? 'bg-success-100 text-success-600'
                          : result.status === 'abnormal'
                          ? 'bg-danger-100 text-danger-600'
                          : 'bg-warning-100 text-warning-600'
                        : 'bg-neutral-100 text-neutral-400'
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="p-4">
            <h4 className="font-medium text-neutral-700 mb-3">总体备注</h4>
            <Input
              type="textarea"
              value={remark}
              onChange={setRemark}
              placeholder="请输入本次点检的总体备注（选填）"
              rows={3}
            />
          </CardContent>
        </Card>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={32} className="text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-700">确认提交点检结果</h3>
              <p className="text-sm text-neutral-500 mt-2">
                请确认点检结果是否完整准确
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-success-500">
                    {completionStats.normal}
                  </p>
                  <p className="text-xs text-neutral-500">正常</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-danger-500">
                    {completionStats.abnormal}
                  </p>
                  <p className="text-xs text-neutral-500">异常</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning-500">
                    {completionStats.skipped}
                  </p>
                  <p className="text-xs text-neutral-500">跳过</p>
                </div>
              </div>
            </div>

            {completionStats.abnormal > 0 && (
              <div className="bg-danger-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-danger-600 font-medium">
                  <AlertCircle size={14} className="inline mr-1" />
                  检测到 {completionStats.abnormal} 项异常，设备状态将自动更新为"保养中"
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                className="flex-1"
              >
                确认提交
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSubmitting && <LoadingOverlay text="正在提交..." />}
    </div>
  );
};
