import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Factory,
  AlertTriangle,
  Send,
  Camera,
  MapPin,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { Input, Select, ImageUpload, RadioGroup } from '../components/common/Form';
import { LoadingOverlay } from '../components/common/Empty';
import { classNames, generateId, formatDate, getPriorityColor, getPriorityText } from '../utils';

const faultTypes = [
  { label: '电气故障', value: '电气故障' },
  { label: '机械故障', value: '机械故障' },
  { label: '液压故障', value: '液压故障' },
  { label: '操作故障', value: '操作故障' },
  { label: '其他故障', value: '其他故障' },
];

const priorities = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
];

export const RepairCreate: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { devices, user, createRepairOrder, updateDeviceStatus } = useAppStore();

  const preSelectedDeviceId = (location.state as any)?.deviceId;

  const [formData, setFormData] = useState({
    deviceId: preSelectedDeviceId || '',
    faultType: '机械故障',
    faultDescription: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimatedDowntime: '',
    images: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDevice = useMemo(
    () => devices.find((d) => d.id === formData.deviceId),
    [devices, formData.deviceId]
  );

  const deviceOptions = useMemo(
    () =>
      devices.map((d) => ({
        label: `${d.name} (${d.deviceNo})`,
        value: d.id,
      })),
    [devices]
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.deviceId) {
      newErrors.deviceId = '请选择故障设备';
    }
    if (!formData.faultDescription.trim()) {
      newErrors.faultDescription = '请输入故障描述';
    }
    if (formData.estimatedDowntime && isNaN(Number(formData.estimatedDowntime))) {
      newErrors.estimatedDowntime = '请输入有效的停机时长';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;

    setIsSubmitting(true);

    try {
      const orderId = createRepairOrder({
        id: generateId('repair'),
        orderNo: `WX${formatDate(new Date(), 'YYYYMMDDHHmmss')}`,
        deviceId: formData.deviceId,
        deviceName: selectedDevice?.name || '',
        deviceNo: selectedDevice?.deviceNo || '',
        faultType: formData.faultType,
        faultDescription: formData.faultDescription.trim(),
        priority: formData.priority,
        status: 'pending',
        reporterId: user.id,
        reporterName: user.realName,
        reporterPhone: user.phone,
        location: selectedDevice?.location || '',
        estimatedDowntime: formData.estimatedDowntime
          ? Number(formData.estimatedDowntime)
          : undefined,
        images: formData.images,
        createdAt: new Date().toISOString(),
        processLogs: [],
      });

      if (formData.priority === 'urgent' || formData.priority === 'high') {
        updateDeviceStatus(formData.deviceId, 'fault');
      }

      setTimeout(() => {
        navigate(`/repair-orders/${orderId}`);
      }, 500);
    } catch (error) {
      console.error('Create repair order error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="故障报修" />

      <div className="px-4 py-4 space-y-4">
        {selectedDevice && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                <Factory size={24} />
              </div>
              <div>
                <h2 className="font-bold">{selectedDevice.name}</h2>
                <p className="text-white/80 text-sm">
                  {selectedDevice.deviceNo} · {selectedDevice.location}
                </p>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-neutral-700 flex items-center">
              <Factory size={18} className="mr-2 text-primary-500" />
              选择设备
            </h3>
            <Select
              label="故障设备"
              value={formData.deviceId}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, deviceId: v }))
              }
              options={deviceOptions}
              placeholder="请选择故障设备"
              error={errors.deviceId}
              required
            />

            {selectedDevice && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-neutral-500">
                  <MapPin size={12} className="mr-1.5" />
                  {selectedDevice.location}
                </div>
                <div className="flex items-center text-neutral-500">
                  <Clock size={12} className="mr-1.5" />
                  运行 {selectedDevice.runHours}h
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-neutral-700 flex items-center">
              <AlertTriangle size={18} className="mr-2 text-danger-500" />
              故障信息
            </h3>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                故障类型 <span className="text-danger-500">*</span>
              </label>
              <RadioGroup
                options={faultTypes}
                value={formData.faultType}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, faultType: v }))
                }
              />
            </div>

            <Input
              label="故障描述"
              type="textarea"
              value={formData.faultDescription}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, faultDescription: v }))
              }
              placeholder="请详细描述故障现象、发生时间等信息..."
              rows={4}
              error={errors.faultDescription}
              required
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                优先级 <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {priorities.map((p) => {
                  const isActive = formData.priority === p.value;
                  return (
                    <button
                      key={p.value}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: p.value as any,
                        }))
                      }
                      className={classNames(
                        'py-2 rounded-lg text-xs font-medium transition-all',
                        isActive
                          ? getPriorityColor(p.value).replace('text-', 'bg-').replace('-600', '-500') + ' text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              {formData.priority === 'urgent' && (
                <div className="mt-2 p-3 bg-danger-50 rounded-lg flex items-start">
                  <AlertCircle size={16} className="text-danger-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-danger-600">
                    紧急优先级将立即通知设备主管，并自动将设备状态更新为"故障"
                  </p>
                </div>
              )}
            </div>

            <Input
              label="预计停机时长"
              type="number"
              value={formData.estimatedDowntime}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, estimatedDowntime: v }))
              }
              placeholder="请输入预计停机时长（小时）"
              suffix="小时"
              error={errors.estimatedDowntime}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Camera size={14} className="inline mr-1" />
                现场照片
              </label>
              <ImageUpload
                value={formData.images}
                onChange={(images) =>
                  setFormData((prev) => ({ ...prev, images }))
                }
                maxCount={9}
              />
              <p className="text-xs text-neutral-400 mt-1">
                上传故障现场照片，便于维修人员快速了解情况
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <User size={18} className="mr-2 text-primary-500" />
              报修人信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-400">姓名</p>
                <p className="font-medium text-neutral-700">{user?.realName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">联系电话</p>
                <p className="font-medium text-neutral-700">{user?.phone}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">部门</p>
                <p className="font-medium text-neutral-700">{user?.department}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">报修时间</p>
                <p className="font-medium text-neutral-700">
                  {formatDate(new Date(), 'HH:mm')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button size="full" variant="primary" onClick={handleSubmit}>
            <Send size={18} className="mr-2" />
            提交报修
          </Button>
          <Button
            size="full"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            取消
          </Button>
        </div>
      </div>

      {isSubmitting && <LoadingOverlay text="正在提交..." />}
    </div>
  );
};
