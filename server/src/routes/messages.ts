import { Router } from 'express';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { requireAuth } from '../auth/middleware';
import { currentMember } from '../auth/context';
import { supabase } from '../supabase';
import { toConversation, toMessage } from '../mappers';
import { evaluateBadges } from '../services/achievements';
import type { ConversationRow, MessageRow } from '../db-types';
import type { Conversation } from '../types';

export const messagesRouter = Router();

async function conversationsFor(memberId: string): Promise<Conversation[]> {
  const convRows = rows<ConversationRow>(await supabase.from('conversations').select('*'));
  const readRows = rows<{ conversation_id: string }>(
    await supabase.from('conversation_reads').select('conversation_id').eq('member_id', memberId),
  );
  const readSet = new Set(readRows.map((row) => row.conversation_id));

  const msgRows = rows<MessageRow>(
    await supabase.from('messages').select('*').order('sent_at', { ascending: false }),
  );
  const latest = new Map<string, MessageRow>();
  for (const message of msgRows) {
    if (!latest.has(message.conversation_id)) latest.set(message.conversation_id, message);
  }

  return convRows
    .map((conversation) => {
      const last = latest.get(conversation.id);
      const lastMessage = last
        ? conversation.is_group && last.author_id === memberId
          ? `You: ${last.body}`
          : last.body
        : conversation.last_message;
      const lastMessageAt = last?.sent_at ?? conversation.last_message_at;
      const unreadCount = readSet.has(conversation.id) ? 0 : conversation.base_unread;
      return toConversation(conversation, { lastMessage, lastMessageAt, unreadCount });
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
}

async function assertConversation(id: string): Promise<ConversationRow> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw HttpError.server(error.message);
  if (!data) throw HttpError.notFound('This conversation no longer exists.');
  return data as ConversationRow;
}

messagesRouter.get(
  '/messages/conversations',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await conversationsFor(currentMember(req).id));
  }),
);

messagesRouter.get(
  '/messages/conversations/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await assertConversation(req.params.id);
    const member = currentMember(req);
    const data = rows<MessageRow>(
      await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', req.params.id)
        .order('sent_at', { ascending: true }),
    );
    res.json(data.map((row) => toMessage(row, member.id)));
  }),
);

messagesRouter.post(
  '/messages/conversations/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    await assertConversation(req.params.id);
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
    if (!body) throw HttpError.badRequest('Write a message first.');

    const sentAt = new Date().toISOString();
    const { data, error } = await supabase
      .from('messages')
      .insert({
        id: `msg-u-${Date.now().toString(36)}`,
        conversation_id: req.params.id,
        author_id: member.id,
        author_name: member.name,
        author_avatar: member.avatar,
        body,
        sent_at: sentAt,
        delivery: 'sent',
      })
      .select('*')
      .single();
    if (error) throw HttpError.server(error.message);

    await supabase
      .from('conversations')
      .update({ last_message: body, last_message_at: sentAt })
      .eq('id', req.params.id);
    await evaluateBadges(member.id);

    res.status(201).json(toMessage(data as MessageRow, member.id));
  }),
);

messagesRouter.post(
  '/messages/conversations/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    await assertConversation(req.params.id);
    const { error } = await supabase.from('conversation_reads').upsert(
      { member_id: member.id, conversation_id: req.params.id, read_at: new Date().toISOString() },
      { onConflict: 'member_id,conversation_id' },
    );
    if (error) throw HttpError.server(error.message);
    res.json(await conversationsFor(member.id));
  }),
);
