import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Factory,
  Wrench,
  Send,
  Calendar,
  User,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { Input, Select, RadioGroup } from '../components/common/Form';
import { LoadingOverlay } from '../components/common/Empty';
import { classNames, generateId, formatDate, getPriorityColor, getPriorityText } from '../utils';

const maintenanceTypes = [
  { label: '日常保养', value: 'routine' },
  { label: '预防性维护', value: 'preventive' },
  { label: '纠正性维修', value: 'corrective' },
];

const priorities = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
];

const defaultTasks = [
  { name: '设备外观检查', description: '检查设备外观是否完好，有无损坏' },
  { name: '润滑系统检查', description: '检查润滑油位，必要时添加' },
  { name: '紧固件检查', description: '检查关键部位紧固件是否松动' },
  { name: '电气系统检查', description: '检查电气连接、开关是否正常' },
];

export const MaintenanceOrderCreate: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { devices, user, createMaintenanceOrder, updateDeviceStatus } = useAppStore();

  const preSelectedDeviceId = (location.state as any)?.deviceId;

  const [formData, setFormData] = useState({
    deviceId: preSelectedDeviceId || '',
    maintenanceType: 'routine' as 'routine' | 'preventive' | 'corrective',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    scheduledDate: formatDate(new Date(), 'YYYY-MM-DD'),
    assigneeId: 'user-001',
    assigneeName: '张工程师',
  });
  const [selectedTasks, setSelectedTasks] = useState<string[]>(
    defaultTasks.map((_, i) => String(i))
  );
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
      newErrors.deviceId = '请选择设备';
    }
    if (!formData.title.trim()) {
      newErrors.title = '请输入保养标题';
    }
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = '请选择计划日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleTask = (index: number) => {
    const idx = String(index);
    setSelectedTasks((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;

    setIsSubmitting(true);

    try {
      const tasks = selectedTasks.map((idx) => {
        const task = defaultTasks[Number(idx)];
        return {
          id: generateId('task'),
          name: task.name,
          description: task.description,
          status: 'pending' as const,
        };
      });

      const typeLabel = maintenanceTypes.find(
        (t) => t.value === formData.maintenanceType
      )?.label || '日常保养';

      const newOrder = createMaintenanceOrder({
        id: generateId('mo'),
        orderNo: `BY${formatDate(new Date(), 'YYYYMMDDHHmmss')}`,
        deviceId: formData.deviceId,
        deviceName: selectedDevice?.name || '',
        deviceNo: selectedDevice?.deviceNo || '',
        title: formData.title.trim(),
        maintenanceType: typeLabel,
        type: formData.maintenanceType,
        priority: formData.priority,
        description: formData.description.trim(),
        tasks,
        items: tasks,
        materials: [],
        status: 'pending',
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        assigneeId: formData.assigneeId,
        assigneeName: formData.assigneeName,
        createdBy: user.id,
        createdByName: user.realName,
        createdAt: new Date().toISOString(),
      });

      if (formData.priority === 'urgent' || formData.priority === 'high') {
        updateDeviceStatus(formData.deviceId, 'maintenance');
      }

      setTimeout(() => {
        navigate(`/maintenance-orders/${newOrder.id}`);
      }, 500);
    } catch (error) {
      console.error('Create maintenance order error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="创建保养工单" />

      <div className="px-4 py-4 space-y-4">
        {selectedDevice && (
          <div className="bg-gradient-to-r from-warning-500 to-warning-600 rounded-2xl p-4 text-white shadow-lg">
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
              label="保养设备"
              value={formData.deviceId}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, deviceId: v }))
              }
              options={deviceOptions}
              placeholder="请选择设备"
              error={errors.deviceId}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-neutral-700 flex items-center">
              <Wrench size={18} className="mr-2 text-warning-500" />
              保养信息
            </h3>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                保养类型 <span className="text-danger-500">*</span>
              </label>
              <RadioGroup
                options={maintenanceTypes}
                value={formData.maintenanceType}
                onChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    maintenanceType: v as any,
                  }))
                }
              />
            </div>

            <Input
              label="保养标题"
              value={formData.title}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, title: v }))
              }
              placeholder="请输入保养标题，如：CNC加工中心月度保养"
              error={errors.title}
              required
            />

            <Input
              label="详细描述"
              type="textarea"
              value={formData.description}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, description: v }))
              }
              placeholder="请输入保养的详细说明和要求..."
              rows={3}
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
                    紧急优先级将立即通知负责人，并自动将设备状态更新为"保养中"
                  </p>
                </div>
              )}
            </div>

            <Input
              label="计划日期"
              type="date"
              value={formData.scheduledDate}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, scheduledDate: v }))
              }
              error={errors.scheduledDate}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-neutral-700 flex items-center">
              <Calendar size={18} className="mr-2 text-primary-500" />
              保养项目
            </h3>
            <p className="text-xs text-neutral-500">请选择需要执行的保养项目：</p>
            <div className="space-y-2">
              {defaultTasks.map((task, index) => {
                const isSelected = selectedTasks.includes(String(index));
                return (
                  <button
                    key={index}
                    onClick={() => toggleTask(index)}
                    className={classNames(
                      'w-full p-3 rounded-xl text-left transition-all border-2',
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 bg-white'
                    )}
                  >
                    <div className="flex items-start">
                      <div
                        className={classNames(
                          'w-5 h-5 rounded flex-shrink-0 mr-3 mt-0.5 flex items-center justify-center',
                          isSelected
                            ? 'bg-primary-500 text-white'
                            : 'bg-neutral-200'
                        )}
                      >
                        {isSelected && <span className="text-xs">✓</span>}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-neutral-700">
                          {task.name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <User size={18} className="mr-2 text-primary-500" />
              负责人信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-400">姓名</p>
                <p className="font-medium text-neutral-700">
                  {formData.assigneeName}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">工号</p>
                <p className="font-medium text-neutral-700">
                  {formData.assigneeId}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">创建人</p>
                <p className="font-medium text-neutral-700">{user?.realName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">创建时间</p>
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
            创建保养工单
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

      {isSubmitting && <LoadingOverlay text="正在创建..." />}
    </div>
  );
};
