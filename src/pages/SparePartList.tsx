import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  AlertTriangle,
  TrendingUp,
  PackageCheck,
  Plus,
  Grid3X3,
  List,
  Filter,
  MapPin,
  Clock,
  ArrowRight,
  Box,
  X,
  ShoppingCart,
  Warehouse,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge, StatCard } from '../components/common/StatusBadge';
import { Header } from '../components/layout/Header';
import { Button, FloatingButton } from '../components/common/Button';
import { Input } from '../components/common/Form';
import { SegmentedControl } from '../components/common/Tabs';
import { Empty, Skeleton } from '../components/common/Empty';
import { classNames, formatDate } from '../utils';

const categoryOptions = [
  { label: '全部', value: 'all' },
  { label: '电气件', value: '电气件' },
  { label: '机械件', value: '机械件' },
  { label: '液压件', value: '液压件' },
  { label: '润滑脂', value: '润滑脂' },
  { label: '过滤器', value: '过滤器' },
  { label: '其他', value: '其他' },
];

const stockOptions = [
  { label: '全部', value: 'all' },
  { label: '充足', value: '充足' },
  { label: '警告', value: '警告' },
  { label: '不足', value: '不足' },
];

export const SparePartList: React.FC = () => {
  const navigate = useNavigate();
  const { spareParts, sparePartRequests, isLoading, user } = useAppStore();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [category, setCategory] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'stock' | 'requests'>('stock');
  const [showFilters, setShowFilters] = useState(false);

  const stats = useMemo(() => {
    const totalValue = spareParts.reduce(
      (sum, part) => sum + part.stock * part.price,
      0
    );
    const lowStock = spareParts.filter(
      (p) => p.stock <= p.minStock
    ).length;
    const pendingRequests = sparePartRequests.filter(
      (r) => r.status === 'pending'
    ).length;

    return [
      {
        label: '备件总数',
        value: spareParts.length.toString(),
        icon: <Package />,
        color: 'primary',
      },
      {
        label: '库存价值',
        value: `¥${totalValue.toLocaleString()}`,
        icon: <TrendingUp />,
        color: 'success',
      },
      {
        label: '库存不足',
        value: lowStock.toString(),
        icon: <AlertTriangle />,
        color: lowStock > 0 ? 'danger' : 'neutral',
      },
      {
        label: '待处理领用',
        value: pendingRequests.toString(),
        icon: <PackageCheck />,
        color: pendingRequests > 0 ? 'warning' : 'neutral',
      },
    ];
  }, [spareParts, sparePartRequests]);

  const filteredParts = useMemo(() => {
    return spareParts.filter((part) => {
      const matchSearch =
        part.name.toLowerCase().includes(search.toLowerCase()) ||
        part.partCode.toLowerCase().includes(search.toLowerCase()) ||
        part.specification.toLowerCase().includes(search.toLowerCase());

      const matchCategory = category === 'all' || part.category === category;

      let stockMatch = true;
      if (stockStatus === '充足') {
        stockMatch = part.stock > part.minStock * 2;
      } else if (stockStatus === '警告') {
        stockMatch =
          part.stock <= part.minStock * 2 && part.stock > part.minStock;
      } else if (stockStatus === '不足') {
        stockMatch = part.stock <= part.minStock;
      }

      return matchSearch && matchCategory && stockMatch;
    });
  }, [spareParts, search, category, stockStatus]);

  const getStockStatus = (part: any) => {
    if (part.stock <= part.minStock) {
      return { text: '库存不足', color: 'danger' };
    } else if (part.stock <= part.minStock * 2) {
      return { text: '库存警告', color: 'warning' };
    }
    return { text: '库存充足', color: 'success' };
  };

  const pendingRequests = useMemo(
    () =>
      sparePartRequests.filter((r) =>
        user?.role === 'admin' || user?.role === 'storekeeper'
          ? r.status === 'pending'
          : r.requesterId === user?.id
      ),
    [sparePartRequests, user]
  );

  const canCreateRequest =
    user?.role === 'admin' ||
    user?.role === 'engineer' ||
    user?.role === 'inspector';

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="备件管理" />

      <div className="px-4 pt-4">
        <SegmentedControl
          options={[
            { key: 'stock', label: '备件库存', value: 'stock' },
            { key: 'requests', label: '领用记录', value: 'requests' },
          ]}
          value={activeTab}
          onChange={(v) => setActiveTab(v as any)}
        />
      </div>

      {activeTab === 'stock' && (
        <div className="px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                color={stat.color as any}
                delay={index * 0.1}
              />
            ))}
          </div>

          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                value={search}
                onChange={setSearch}
                placeholder="搜索备件名称、编码..."
                className="pl-10"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={classNames(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                showFilters
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200'
              )}
            >
              <Filter size={20} />
            </button>
            <button
              onClick={() =>
                setViewMode(viewMode === 'list' ? 'grid' : 'list')
              }
              className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-neutral-600 border border-neutral-200"
            >
              {viewMode === 'list' ? (
                <Grid3X3 size={20} />
              ) : (
                <List size={20} />
              )}
            </button>
          </div>

          {showFilters && (
            <div className="animate-fade-in bg-white rounded-2xl p-4 border border-neutral-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  备件分类
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCategory(opt.value)}
                      className={classNames(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        category === opt.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  库存状态
                </label>
                <div className="flex flex-wrap gap-2">
                  {stockOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStockStatus(opt.value)}
                      className={classNames(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        stockStatus === opt.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={80} />
              ))}
            </div>
          ) : filteredParts.length === 0 ? (
            <Empty
              title="暂无备件"
              description="没有找到符合条件的备件"
              icon={<Package />}
            />
          ) : viewMode === 'list' ? (
            <div className="space-y-3">
              {filteredParts.map((part, index) => {
                const stockStatus = getStockStatus(part);
                return (
                  <Card
                    key={part.id}
                    className="animate-slide-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="font-bold text-neutral-700 truncate">
                              {part.name}
                            </h3>
                            <StatusBadge
                              status={stockStatus.text}
                              variant="dot"
                              color={stockStatus.color as any}
                              className="ml-2 flex-shrink-0"
                            />
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">
                            {part.partCode} · {part.specification}
                          </p>
                          <div className="flex items-center text-xs text-neutral-400 mt-2">
                            <span
                              className={classNames(
                                'px-2 py-0.5 rounded-full mr-2',
                                stockStatus.color === 'danger'
                                  ? 'bg-danger-50 text-danger-600'
                                  : stockStatus.color === 'warning'
                                  ? 'bg-warning-50 text-warning-600'
                                  : 'bg-success-50 text-success-600'
                              )}
                            >
                              {part.category}
                            </span>
                            <span className="flex items-center">
                              <Warehouse size={10} className="mr-1" />
                              {part.location}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p
                            className={classNames(
                              'text-xl font-bold',
                              stockStatus.color === 'danger'
                                ? 'text-danger-500'
                                : stockStatus.color === 'warning'
                                ? 'text-warning-500'
                                : 'text-primary-600'
                            )}
                          >
                            {part.stock}
                            <span className="text-xs text-neutral-400 font-normal ml-1">
                              {part.unit}
                            </span>
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            安全库存 {part.minStock}
                          </p>
                          <p className="text-xs text-primary-500 font-medium mt-1">
                            ¥{part.price.toFixed(2)}/{part.unit}
                          </p>
                        </div>
                      </div>

                      {canCreateRequest && (
                        <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-end">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              navigate('/spare-parts/request', {
                                state: { partId: part.id },
                              })
                            }
                          >
                            <ShoppingCart size={14} className="mr-1" />
                            领用
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredParts.map((part, index) => {
                const stockStatus = getStockStatus(part);
                return (
                  <Card
                    key={part.id}
                    className="animate-slide-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div
                          className={classNames(
                            'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2',
                            stockStatus.color === 'danger'
                              ? 'bg-danger-100'
                              : stockStatus.color === 'warning'
                              ? 'bg-warning-100'
                              : 'bg-primary-100'
                          )}
                        >
                          <Box
                            size={24}
                            className={
                              stockStatus.color === 'danger'
                                ? 'text-danger-500'
                                : stockStatus.color === 'warning'
                                ? 'text-warning-500'
                                : 'text-primary-500'
                            }
                          />
                        </div>
                        <h3 className="font-medium text-neutral-700 text-sm truncate">
                          {part.name}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5 truncate">
                          {part.partCode}
                        </p>
                        <p
                          className={classNames(
                            'text-lg font-bold mt-2',
                            stockStatus.color === 'danger'
                              ? 'text-danger-500'
                              : stockStatus.color === 'warning'
                              ? 'text-warning-500'
                              : 'text-primary-600'
                          )}
                        >
                          {part.stock}
                          <span className="text-xs text-neutral-400 font-normal ml-1">
                            {part.unit}
                          </span>
                        </p>
                        <StatusBadge
                          status={stockStatus.text}
                          variant="dot"
                          color={stockStatus.color as any}
                          className="mt-1 mx-auto"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {pendingRequests.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-neutral-700 flex items-center">
                    <PackageCheck
                      size={18}
                      className="mr-2 text-warning-500"
                    />
                    待处理领用
                    <span className="ml-2 w-5 h-5 bg-warning-500 text-white rounded-full text-xs flex items-center justify-center">
                      {pendingRequests.length}
                    </span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs text-primary-500 font-medium flex items-center"
                  >
                    查看全部
                    <ArrowRight size={12} className="ml-1" />
                  </button>
                </div>
                <div className="space-y-2">
                  {pendingRequests.slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      onClick={() =>
                        navigate(`/spare-parts/requests/${request.id}`)
                      }
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-neutral-700 text-sm">
                          {request.requestNo}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {request.requesterName} ·{' '}
                          {formatDate(
                            new Date(request.createdAt),
                            'MM-DD HH:mm'
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-700">
                          {request.items.length} 项备件
                        </p>
                        <StatusBadge
                          status="待处理"
                          variant="light"
                          color="warning"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="px-4 py-4 space-y-4">
          <div className="space-y-3">
            {sparePartRequests.length === 0 ? (
              <Empty
                title="暂无领用记录"
                description="还没有备件领用申请"
                icon={<PackageCheck />}
              />
            ) : (
              sparePartRequests.map((request, index) => (
                <Card
                  key={request.id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() =>
                    navigate(`/spare-parts/requests/${request.id}`)
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="font-bold text-neutral-700">
                            {request.requestNo}
                          </h3>
                          <StatusBadge
                            status={request.status}
                            variant="light"
                            className="ml-2 flex-shrink-0"
                          />
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {request.requesterName} ·{' '}
                          {request.requesterDepartment}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {request.items.slice(0, 3).map((item, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full"
                            >
                              {item.partName} ×{item.quantity}
                            </span>
                          ))}
                          {request.items.length > 3 && (
                            <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
                              +{request.items.length - 3}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-2">
                          {formatDate(
                            new Date(request.createdAt),
                            'YYYY-MM-DD HH:mm'
                          )}
                        </p>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-lg font-bold text-primary-600">
                          ¥
                          {request.items
                            .reduce(
                              (sum, item) =>
                                sum + item.unitPrice * item.quantity,
                              0
                            )
                            .toFixed(2)}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {request.items.length} 项
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {canCreateRequest && activeTab === 'stock' && (
        <FloatingButton
          icon={<Plus />}
          label="新建领用"
          onClick={() => navigate('/spare-parts/request')}
        />
      )}
    </div>
  );
};
