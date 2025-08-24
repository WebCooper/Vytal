import { axiosInstance } from './axiosInstance';

export type AdminStats = {
  totalUsers: number;
  recipients: number;
  donors: number;
  totalPosts: number;
  pendingPosts: number;
};

type StatsEnvelope = { data: AdminStats } | AdminStats;

export const getAdminStats = async (): Promise<AdminStats> => {
  const res = await axiosInstance.get<StatsEnvelope>(`/admin/stats`);
  const body = res.data;
  if (typeof body === 'object' && body !== null && 'data' in body) {
    return (body as { data: AdminStats }).data;
  }
  return body as AdminStats;
};
