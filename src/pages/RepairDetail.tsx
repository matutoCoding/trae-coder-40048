import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Factory,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Send,
  Camera,
  FileText,
  Package,
  MapPin,
  ArrowRight,
  AlertCircle,
  Wrench,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge, ProgressBar } from '../components/common/StatusBadge';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { Input, ImageUpload, Select } from '../components/common/Form';
import { Empty, LoadingOverlay } from '../components/common/Empty';
import { classNames, formatDate, getPriorityColor, getPriorityText, generateId } from '../utils';
import type { SparePartUsage, RepairProcessLog } from '../types';

export const RepairDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    repairOrders,
    devices,
    spareParts,
    user,
    updateRepairOrder,
    updateDeviceStatus,
  } = useAppStore();

  const [diagnosis, setDiagnosis] = useState('');
  const [solution, setSolution] = useState('');
  const [remark, setRemark] = useState('');
  const [laborHours, setLaborHours] = useState(0);
  const [sparePartUsages, setSparePartUsages] = useState<SparePartUsage[]>([]);
  const [newLog, setNewLog] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSparePartSelect, setShowSparePartSelect] = useState(false);

  const order = useMemo(
    () => repairOrders.find((o) => o.id === id),
    [repairOrders, id]
  );
  const device = useMemo(
    () => devices.find((d) => d.id === order?.deviceId),
    [devices, order]
  );

  const handleStart = () => {
    if (!order || !user) return;
    updateRepairOrder(order.id, {
      status: 'in_progress',
      assigneeId: user.id,
      assigneeName: user.realName,
      actualStartDate: new Date().toISOString(),
    });
    addProcessLog('开始维修');
  };

  const handleAddSparePart = (part: any) => {
    setSparePartUsages((prev) => [
      ...prev,
      {
        partId: part.id,
        partName: part.name,
        partCode: part.partCode,
        specification: part.specification,
        quantity: 1,
        unit: part.unit,
        unitPrice: part.price,
      },
    ]);
    setShowSparePartSelect(false);
  };

  const handleUpdateSparePartQuantity = (index: number, quantity: number) => {
    if (quantity < 0) return;
    setSparePartUsages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  };

  const handleRemoveSparePart = (index: number) => {
    setSparePartUsages((prev) => prev.filter((_, i) => i !== index));
  };

  const addProcessLog = (content: string) => {
    if (!order || !user) return;

    const log: RepairProcessLog = {
      id: generateId('log'),
      operatorId: user.id,
      operatorName: user.realName,
      timestamp: new Date().toISOString(),
      action: content,
      remark: '',
    };

    const newLogs = [...(order.processLogs || []), log];
    updateRepairOrder(order.id, { processLogs: newLogs });
  };

  const handleAddLog = () => {
    if (!newLog.trim()) return;
    addProcessLog(newLog.trim());
    setNewLog('');
  };

  const handleSubmit = async () => {
    if (!order || !device || !user) return;

    setIsSubmitting(true);

    try {
      const totalCost =
        sparePartUsages.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) +
        laborHours * 100;

      await updateRepairOrder(order.id, {
        status: 'completed',
        actualEndDate: new Date().toISOString(),
        diagnosis,
        solution,
        remark,
        spareParts: sparePartUsages,
        laborHours,
        totalCost,
      });

      await updateDeviceStatus(device.id, 'running');

      setTimeout(() => {
        navigate('/repair-orders');
      }, 500);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Empty title="工单不存在" description="该维修工单可能已被删除" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Empty title="设备不存在" description="关联设备可能已被删除" />
      </div>
    );
  }

  const isMine = order.assigneeId === user?.id;
  const canEdit =
    isMine && (order.status === 'pending' || order.status === 'in_progress');

  const getFaultTypeColor = (type: string) => {
    switch (type) {
      case '电气故障':
        return 'bg-yellow-100 text-yellow-600';
      case '机械故障':
        return 'bg-blue-100 text-blue-600';
      case '液压故障':
        return 'bg-cyan-100 text-cyan-600';
      case '操作故障':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  const actualDuration = useMemo(() => {
    if (!order.actualStartDate) return 0;
    const end = order.actualEndDate ? new Date(order.actualEndDate) : new Date();
    const start = new Date(order.actualStartDate);
    return ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
  }, [order.actualStartDate, order.actualEndDate]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="维修工单详情" />

      <div className="px-4 py-4 space-y-4">
        <div
          className={classNames(
            'rounded-2xl p-5 text-white shadow-lg',
            order.status === 'completed'
              ? 'bg-gradient-to-r from-success-500 to-success-600'
              : order.status === 'in_progress'
              ? 'bg-gradient-to-r from-primary-500 to-primary-600'
              : order.priority === 'urgent'
              ? 'bg-gradient-to-r from-danger-500 to-danger-600 animate-pulse-soft'
              : 'bg-gradient-to-r from-warning-500 to-warning-600'
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold">{order.orderNo}</h1>
                <p className="text-white/80 text-sm mt-0.5">{order.faultType}</p>
              </div>
            </div>
            <StatusBadge status={order.status} variant="light" />
          </div>
          <p className="text-white/90">{order.faultDescription}</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <Factory size={18} className="mr-2 text-primary-500" />
              设备信息
            </h3>
            <div
              onClick={() => navigate(`/devices/${device.id}`)}
              className="flex items-center p-3 bg-neutral-50 rounded-xl cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <Factory size={20} className="text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-700">{device.name}</p>
                <p className="text-xs text-neutral-500">
                  {device.deviceNo} · {device.model}
                </p>
                <p className="text-xs text-neutral-400 mt-1 flex items-center">
                  <MapPin size={10} className="mr-1" />
                  {device.location}
                </p>
              </div>
              <ArrowRight size={16} className="text-neutral-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <FileText size={18} className="mr-2 text-primary-500" />
              基本信息
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-500 flex items-center">
                  <AlertTriangle size={14} className="mr-2" />
                  故障类型
                </span>
                <span
                  className={classNames(
                    'text-xs px-2 py-0.5 rounded-full',
                    getFaultTypeColor(order.faultType)
                  )}
                >
                  {order.faultType}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-500 flex items-center">
                  <AlertCircle size={14} className="mr-2" />
                  优先级
                </span>
                <span
                  className={classNames(
                    'text-xs px-2 py-0.5 rounded-full',
                    getPriorityColor(order.priority)
                  )}
                >
                  {getPriorityText(order.priority)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-500 flex items-center">
                  <User size={14} className="mr-2" />
                  上报人
                </span>
                <span className="text-sm font-medium text-neutral-700">
                  {order.reporterName}
                </span>
              </div>
              {order.assigneeName && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-500 flex items-center">
                    <Wrench size={14} className="mr-2" />
                    维修人
                  </span>
                  <span className="text-sm font-medium text-neutral-700">
                    {order.assigneeName}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-500 flex items-center">
                  <Calendar size={14} className="mr-2" />
                  上报时间
                </span>
                <span className="text-sm font-medium text-neutral-700">
                  {formatDate(new Date(order.createdAt), 'YYYY-MM-DD HH:mm')}
                </span>
              </div>
              {order.actualStartDate && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-500 flex items-center">
                    <Clock size={14} className="mr-2" />
                    维修时长
                  </span>
                  <span className="text-sm font-medium text-neutral-700">
                    {actualDuration} 小时
                  </span>
                </div>
              )}
              {order.estimatedDowntime && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-500 flex items-center">
                    <Clock size={14} className="mr-2" />
                    预计停机
                  </span>
                  <span className="text-sm font-medium text-neutral-700">
                    {order.estimatedDowntime} 小时
                  </span>
                </div>
              )}
              {order.totalCost !== undefined && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-neutral-500 flex items-center">
                    <Package size={14} className="mr-2" />
                    费用总计
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    ¥{order.totalCost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {order.images && order.images.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-neutral-700 mb-3 flex items-center">
                <Camera size={18} className="mr-2 text-primary-500" />
                故障照片
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {order.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`故障照片 ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {order.status === 'pending' && canEdit && (
          <Button size="full" variant="primary" onClick={handleStart}>
            <Play size={18} className="mr-2" />
            开始维修
          </Button>
        )}

        {canEdit && order.status === 'in_progress' && (
          <div className="animate-fade-in space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-bold text-neutral-700 flex items-center">
                  <Wrench size={18} className="mr-2 text-primary-500" />
                  维修记录
                </h3>

                <Input
                  label="故障诊断"
                  type="textarea"
                  value={diagnosis}
                  onChange={setDiagnosis}
                  placeholder="请输入故障诊断结果..."
                  rows={3}
                  required
                />

                <Input
                  label="维修方案"
                  type="textarea"
                  value={solution}
                  onChange={setSolution}
                  placeholder="请输入维修方案和处理过程..."
                  rows={3}
                  required
                />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-neutral-700 flex items-center">
                      <Package size={18} className="mr-2 text-primary-500" />
                      备件使用
                    </label>
                    <button
                      onClick={() => setShowSparePartSelect(true)}
                      className="text-sm text-primary-500 font-medium"
                    >
                      + 添加
                    </button>
                  </div>
                  {sparePartUsages.length > 0 ? (
                    <div className="space-y-2">
                      {sparePartUsages.map((usage, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-700 text-sm truncate">
                              {usage.partName}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {usage.partCode} · {usage.specification}
                            </p>
                          </div>
                          <div className="flex items-center ml-3">
                            <button
                              onClick={() =>
                                handleUpdateSparePartQuantity(
                                  index,
                                  usage.quantity - 1
                                )
                              }
                              className="w-7 h-7 bg-neutral-200 rounded flex items-center justify-center text-neutral-600"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {usage.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateSparePartQuantity(
                                  index,
                                  usage.quantity + 1
                                )
                              }
                              className="w-7 h-7 bg-primary-100 rounded flex items-center justify-center text-primary-600"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleRemoveSparePart(index)}
                              className="ml-2 text-danger-500"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-neutral-400 text-sm">
                      暂无使用备件
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    工时统计
                  </label>
                  <div className="text-center mb-3">
                    <span className="text-3xl font-bold text-primary-500">
                      {laborHours}
                    </span>
                    <span className="text-neutral-500 ml-1">小时</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setLaborHours(Math.max(0, laborHours - 0.5))}
                      className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-xl font-bold text-neutral-600"
                    >
                      -
                    </button>
                    <div className="flex-1">
                      <ProgressBar
                        progress={(laborHours / 8) * 100}
                        color="primary"
                        height={8}
                      />
                    </div>
                    <button
                      onClick={() => setLaborHours(Math.min(8, laborHours + 0.5))}
                      className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-xl font-bold text-primary-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Input
                  label="维修备注"
                  type="textarea"
                  value={remark}
                  onChange={setRemark}
                  placeholder="请输入维修备注（选填）"
                  rows={2}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-neutral-700 mb-3 flex items-center">
                  <MessageSquare size={18} className="mr-2 text-primary-500" />
                  维修过程记录
                </h3>
                <div className="flex space-x-2 mb-4">
                  <Input
                    value={newLog}
                    onChange={setNewLog}
                    placeholder="添加过程记录..."
                    className="flex-1"
                  />
                  <Button variant="primary" onClick={handleAddLog}>
                    <Plus size={18} />
                  </Button>
                </div>
                {order.processLogs && order.processLogs.length > 0 ? (
                  <div className="space-y-3">
                    {order.processLogs
                      .slice()
                      .reverse()
                      .map((log, index) => (
                        <div
                          key={log.id}
                          className="flex items-start animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-neutral-700">{log.action}</p>
                            <div className="flex items-center text-xs text-neutral-400 mt-1">
                              <span>{log.operatorName}</span>
                              <span className="mx-2">·</span>
                              <span>
                                {formatDate(
                                  new Date(log.timestamp),
                                  'MM-DD HH:mm'
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-neutral-400 text-sm">
                    暂无过程记录
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              size="full"
              variant="success"
              onClick={() => setShowConfirm(true)}
              disabled={!diagnosis.trim() || !solution.trim()}
            >
              <CheckCircle2 size={18} className="mr-2" />
              完成维修
            </Button>
          </div>
        )}

        {order.status === 'completed' && (
          <div className="space-y-4">
            {order.diagnosis && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-neutral-700 mb-3">故障诊断</h3>
                  <p className="text-sm text-neutral-600">{order.diagnosis}</p>
                </CardContent>
              </Card>
            )}

            {order.solution && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-neutral-700 mb-3">维修方案</h3>
                  <p className="text-sm text-neutral-600">{order.solution}</p>
                </CardContent>
              </Card>
            )}

            {order.spareParts && order.spareParts.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-neutral-700 mb-3">使用备件</h3>
                  <div className="space-y-2">
                    {order.spareParts.map((part, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-700 text-sm">
                            {part.partName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {part.partCode} · {part.specification}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-neutral-700">
                            {part.quantity} {part.unit}
                          </p>
                          <p className="text-xs text-primary-500">
                            ¥{(part.unitPrice * part.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {order.laborHours !== undefined && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-500">工时</span>
                    <span className="text-sm font-medium text-neutral-700">
                      {order.laborHours} 小时 (¥{order.laborHours * 100})
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {order.processLogs && order.processLogs.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-neutral-700 mb-3">维修过程</h3>
                  <div className="space-y-3">
                    {order.processLogs
                      .slice()
                      .reverse()
                      .map((log, index) => (
                        <div
                          key={log.id}
                          className="flex items-start"
                        >
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-neutral-700">{log.action}</p>
                            <div className="flex items-center text-xs text-neutral-400 mt-1">
                              <span>{log.operatorName}</span>
                              <span className="mx-2">·</span>
                              <span>
                                {formatDate(
                                  new Date(log.timestamp),
                                  'MM-DD HH:mm'
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {order.remark && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-neutral-700 mb-2">维修备注</h3>
                  <p className="text-sm text-neutral-600">{order.remark}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-success-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-700">确认完成维修</h3>
              <p className="text-sm text-neutral-500 mt-2">
                请确认维修信息是否完整准确
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-600">备件费用</span>
                <span className="text-sm font-medium text-neutral-700">
                  ¥
                  {sparePartUsages
                    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-600">工时费用</span>
                <span className="text-sm font-medium text-neutral-700">
                  ¥{laborHours * 100}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-700">
                    总计
                  </span>
                  <span className="text-xl font-bold text-primary-600">
                    ¥
                    {(
                      sparePartUsages.reduce(
                        (sum, item) => sum + item.unitPrice * item.quantity,
                        0
                      ) + laborHours * 100
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button variant="primary" onClick={handleSubmit} className="flex-1">
                确认提交
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSparePartSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-2xl w-full max-h-[70vh] overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-neutral-700">选择备件</h3>
              <button
                onClick={() => setShowSparePartSelect(false)}
                className="text-neutral-400"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {spareParts.map((part) => (
                  <div
                    key={part.id}
                    onClick={() => handleAddSparePart(part)}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl cursor-pointer active:bg-neutral-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-700">{part.name}</p>
                      <p className="text-xs text-neutral-500">
                        {part.partCode} · {part.specification}
                      </p>
                      <p className="text-xs text-primary-500 mt-0.5">
                        库存：{part.stock} {part.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-700">
                        ¥{part.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-neutral-400">/{part.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isSubmitting && <LoadingOverlay text="正在提交..." />}
    </div>
  );
};
