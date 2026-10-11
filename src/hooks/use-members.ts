import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { Member, MemberRole, Paged } from '@/types';

interface MemberQuery {
  search?: string;
  role?: string;
  page?: number;
}

export function useMembers(query: MemberQuery = {}): UseQueryResult<Paged<Member>> {
  return useQuery({
    queryKey: queryKeys.members(query as Record<string, unknown>),
    queryFn: () => api.members.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useMember(id: string | undefined): UseQueryResult<Member> {
  return useQuery({
    queryKey: queryKeys.member(id ?? ''),
    queryFn: () => api.members.get(id!),
    enabled: Boolean(id),
  });
}

export function useSetMemberRole() {
  const queryClient = useQueryClient();
  return useMutation<Member, unknown, { memberId: string; role: MemberRole }>({
    mutationFn: ({ memberId, role }) => api.members.setRole(memberId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useToggleConnection() {
  const queryClient = useQueryClient();
  return useMutation<boolean, unknown, { memberId: string }>({
    mutationFn: ({ memberId }) => api.members.toggleConnection(memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}
