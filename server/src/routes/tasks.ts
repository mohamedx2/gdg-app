import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { requireAuth, requireOrganizer } from '../auth/middleware';
import { currentMember } from '../auth/context';
import { supabase } from '../supabase';
import { toTask } from '../mappers';
import { awardPoints } from '../services/points';
import { evaluateBadges } from '../services/achievements';
import type { TaskRow } from '../db-types';
import type { Task, TaskStatus } from '../types';

export const tasksRouter = Router();

const PRIORITY_RANK: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };

async function eventTitles(ids: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const data = rows<{ id: string; title: string }>(
    await supabase.from('events').select('id, title').in('id', unique),
  );
  return new Map(data.map((row) => [row.id, row.title]));
}

async function listTasks(memberId: string): Promise<Task[]> {
  const taskRows = rows<TaskRow>(await supabase.from('tasks').select('*'));
  const titles = await eventTitles(taskRows.map((row) => row.event_id ?? ''));

  return taskRows
    .map((row) =>
      toTask(row, {
        isMine: row.assignee_id === memberId,
        eventTitle: row.event_id ? titles.get(row.event_id) : undefined,
      }),
    )
    .sort((a, b) => {
      const doneA = a.status === 'done' ? 1 : 0;
      const doneB = b.status === 'done' ? 1 : 0;
      if (doneA !== doneB) return doneA - doneB;
      const mineA = a.isMine ? 0 : 1;
      const mineB = b.isMine ? 0 : 1;
      if (mineA !== mineB) return mineA - mineB;
      if (PRIORITY_RANK[a.priority] !== PRIORITY_RANK[b.priority]) {
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      }
      return new Date(a.dueAt ?? a.createdAt).getTime() - new Date(b.dueAt ?? b.createdAt).getTime();
    });
}

tasksRouter.get(
  '/tasks',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await listTasks(currentMember(req).id));
  }),
);

const statusSchema = z.object({ status: z.enum(['todo', 'in-progress', 'done']) });

tasksRouter.patch(
  '/tasks/:id/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) throw HttpError.badRequest('Pick a valid task status.');
    const member = currentMember(req);
    const status = parsed.data.status as TaskStatus;

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (taskError) throw HttpError.server(taskError.message);
    if (!task) throw HttpError.notFound('This task no longer exists.');
    const current = task as TaskRow;

    const { error } = await supabase
      .from('tasks')
      .update({ status, completed_at: status === 'done' ? new Date().toISOString() : null })
      .eq('id', req.params.id);
    if (error) throw HttpError.server(error.message);

    if (status === 'done') {
      const { data: existing } = await supabase
        .from('task_completions')
        .select('task_id')
        .eq('member_id', member.id)
        .eq('task_id', current.id)
        .maybeSingle();
      if (!existing) {
        await supabase
          .from('task_completions')
          .insert({ member_id: member.id, task_id: current.id, completed_at: new Date().toISOString() });
        await awardPoints(member.id, current.points);
        await evaluateBadges(member.id);
      }
    }

    const list = await listTasks(member.id);
    res.json(list.find((item) => item.id === current.id));
  }),
);

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']),
  points: z.number().int().positive().optional(),
  dueAt: z.string().optional(),
  assigneeName: z.string().optional(),
  eventId: z.string().optional(),
});

tasksRouter.post(
  '/tasks',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw HttpError.badRequest(parsed.error.issues[0]?.message ?? 'That task is invalid.');
    const member = currentMember(req);
    const input = parsed.data;

    let assigneeId = member.id;
    let assigneeName = input.assigneeName?.trim() || member.name;
    let assigneeAvatar = member.avatar;
    if (input.assigneeName?.trim() && input.assigneeName.trim() !== member.name) {
      const { data: found } = await supabase
        .from('members')
        .select('id, name, avatar')
        .ilike('name', input.assigneeName.trim())
        .maybeSingle();
      if (found) {
        assigneeId = found.id as string;
        assigneeName = found.name as string;
        assigneeAvatar = found.avatar as string;
      } else {
        assigneeId = member.id;
        assigneeAvatar = '';
      }
    }

    let eventId: string | undefined;
    if (input.eventId) {
      const { data: event } = await supabase
        .from('events')
        .select('id')
        .eq('id', input.eventId)
        .maybeSingle();
      eventId = event ? (event.id as string) : undefined;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        id: `task-u-${Date.now().toString(36)}`,
        title: input.title.trim(),
        description: input.description.trim(),
        status: 'todo',
        priority: input.priority,
        points: input.points ?? 20,
        due_at: input.dueAt ?? null,
        event_id: eventId ?? null,
        assignee_id: assigneeId,
        assignee_name: assigneeName,
        assignee_avatar: assigneeAvatar,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw HttpError.server(error.message);

    const list = await listTasks(member.id);
    res.status(201).json(list.find((item) => item.id === (data as TaskRow).id));
  }),
);
