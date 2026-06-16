import type { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u001',
    username: 'admin',
    name: '张管理',
    role: 'admin',
    phone: '13800138001',
    avatar: '',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'u002',
    username: 'engineer1',
    name: '李工',
    role: 'engineer',
    phone: '13800138002',
    avatar: '',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'u003',
    username: 'engineer2',
    name: '王工',
    role: 'engineer',
    phone: '13800138003',
    avatar: '',
    status: 'active',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 'u004',
    username: 'inspector1',
    name: '赵点检',
    role: 'inspector',
    phone: '13800138004',
    avatar: '',
    status: 'active',
    createdAt: '2024-01-04T00:00:00Z',
  },
  {
    id: 'u005',
    username: 'inspector2',
    name: '钱点检',
    role: 'inspector',
    phone: '13800138005',
    avatar: '',
    status: 'active',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'u006',
    username: 'operator1',
    name: '孙操作',
    role: 'operator',
    phone: '13800138006',
    avatar: '',
    status: 'active',
    createdAt: '2024-01-06T00:00:00Z',
  },
  {
    id: 'u007',
    username: 'operator2',
    name: '周操作',
    role: 'operator',
    phone: '13800138007',
    avatar: '',
    status: 'active',
    createdAt: '2024-01-07T00:00:00Z',
  },
];

export const getCurrentUser = (): User => {
  return mockUsers[0];
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(u => u.id === id);
};

export const getUserByRole = (role: User['role']): User[] => {
  return mockUsers.filter(u => u.role === role);
};
