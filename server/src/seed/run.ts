import { hashPassword } from '../auth/password';
import { env } from '../env';
import { supabase } from '../supabase';
import {
  seedActivity,
  seedAnnouncements,
  seedArrivals,
  seedBadges,
  seedConversations,
  seedDecisions,
  seedEvents,
  seedIdeas,
  seedMembers,
  seedMessages,
  seedNotifications,
  seedPresenceMembers,
  seedProfile,
  seedQuests,
  seedQuizQuestions,
  seedResources,
  seedSquads,
  seedTasks,
} from './data';

const DEMO_ACCOUNTS = [
  { email: 'admin@epi.dev', password: 'gdgepi2026', memberId: 'usr-maram', role: 'super-admin', name: 'Maram Belgacem' },
  { email: 'organizer@epi.dev', password: 'gdgepi2026', memberId: 'usr-meriem', role: 'core-team', name: 'Meriem Trabelsi' },
  { email: 'member@epi.dev', password: 'gdgepi2026', memberId: 'usr-you', role: 'student', name: 'Mohamed Salah' },
];

async function upsert(table: string, rows: Record<string, unknown>[], onConflict = 'id'): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ${table}: ${rows.length} rows`);
}

async function main(): Promise<void> {
  console.log(`Seeding ${env.supabaseUrl} ...`);

  // ── Members ───────────────────────────────────────────────────────────
  const archiveJoinedAt = '2025-09-01T09:00:00.000Z';
  const memberRows: Record<string, unknown>[] = seedMembers.map((member) => ({
    id: member.id,
    email: `${member.id}@epi.dev`,
    name: member.name,
    role: member.role,
    headline: member.headline,
    bio: member.bio,
    avatar: member.avatar,
    online: member.online,
    skills: member.skills ?? [],
    socials: member.socials ?? {},
    mutual_events: member.mutualEvents ?? 0,
    projects: member.projects ?? [],
    badges: member.badges ?? 0,
    points: member.points ?? 0,
    events_attended: member.eventsAttended ?? 0,
    workshops: 0,
    tier: 'Novice',
    joined_at: archiveJoinedAt,
  }));

  // The signed-in demo profile is a real member row too.
  memberRows.push({
    id: seedProfile.id,
    email: seedProfile.email,
    name: seedProfile.name,
    role: seedProfile.role,
    headline: seedProfile.headline,
    bio: seedProfile.bio,
    avatar: seedProfile.avatar,
    online: true,
    skills: seedProfile.skills ?? [],
    socials: seedProfile.socials ?? {},
    mutual_events: 0,
    projects: [],
    badges: seedProfile.badges ?? 0,
    points: seedProfile.points ?? 0,
    events_attended: seedProfile.eventsAttended ?? 0,
    workshops: seedProfile.workshops ?? 0,
    tier: seedProfile.tier,
    joined_at: seedProfile.joinedAt,
  });

  await upsert('members', memberRows);

  // ── Demo auth accounts ────────────────────────────────────────────────
  for (const account of DEMO_ACCOUNTS) {
    const { error } = await supabase
      .from('members')
      .update({
        email: account.email,
        password_hash: await hashPassword(account.password),
        role: account.role,
        name: account.name,
        online: true,
      })
      .eq('id', account.memberId);
    if (error) throw new Error(`demo account ${account.email}: ${error.message}`);
    console.log(`  account: ${account.email} (${account.role})`);
  }

  // ── Presence (coarse, opt-in) ─────────────────────────────────────────
  for (const presence of seedPresenceMembers) {
    const { error } = await supabase
      .from('members')
      .update({
        presence_status: presence.status,
        presence_scope: presence.status === 'off_campus' ? 'none' : 'event',
        presence_window_label: presence.venue ?? null,
        presence_eta_mins: presence.etaMins ?? null,
        presence_ghost: false,
        presence_share_team: true,
        presence_updated_at: presence.updatedAt ?? new Date().toISOString(),
      })
      .eq('id', presence.id);
    if (error) throw new Error(`presence ${presence.id}: ${error.message}`);
  }
  console.log(`  presence: ${seedPresenceMembers.length} members`);

  // ── Content ───────────────────────────────────────────────────────────
  await upsert(
    'events',
    seedEvents.map((event) => ({
      id: event.id,
      title: event.title,
      summary: event.summary,
      description: event.description,
      category: event.category,
      track: event.track,
      starts_at: event.startsAt,
      ends_at: event.endsAt,
      duration_label: event.durationLabel,
      location: event.location,
      venue: event.venue,
      capacity: event.capacity,
      registered_count: event.registeredCount,
      cover_image: event.coverImage,
      speaker: event.speaker ?? null,
      featured: event.featured,
      flagship: event.flagship,
      prize: event.prize ?? null,
      highlights: event.highlights ?? [],
      perks: event.perks ?? null,
      agenda: event.agenda ?? null,
      organizer_note: event.organizerNote ?? null,
    })),
  );

  await upsert(
    'resources',
    seedResources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      summary: resource.summary,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      difficulty: resource.difficulty,
      technologies: resource.technologies ?? [],
      duration_mins: resource.durationMins,
      author: resource.author,
      cover_image: resource.coverImage,
      url: resource.url,
      points: resource.points,
    })),
  );

  await upsert(
    'announcements',
    seedAnnouncements.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      tag: announcement.tag,
      deadline: announcement.deadline ?? null,
      created_at: announcement.createdAt,
      cta_label: announcement.ctaLabel ?? null,
      cta_link: announcement.ctaLink ?? null,
      pinned: announcement.pinned,
    })),
  );

  await upsert(
    'activity',
    seedActivity.map((item) => ({
      id: item.id,
      kind: item.kind,
      actor: item.actor,
      action: item.action,
      target: item.target ?? null,
      target_id: item.targetId ?? null,
      meta: item.meta ?? null,
      stars: item.stars ?? null,
      created_at: item.createdAt,
    })),
  );

  await upsert(
    'badges',
    seedBadges.map((badge, index) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      points: badge.points,
      rarity: badge.rarity,
      seed_unlocked: badge.unlocked,
      sort_order: index,
    })),
  );

  await upsert(
    'squads',
    seedSquads.map((squad) => ({
      id: squad.id,
      name: squad.name,
      track: squad.track,
      emblem: squad.emblem,
      tagline: squad.tagline,
      member_count: squad.memberCount,
      squad_xp: squad.squadXp,
      week_xp: squad.weekXp,
    })),
  );

  await upsert(
    'quests',
    seedQuests.map((quest, index) => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      icon: quest.icon,
      track: quest.track ?? null,
      reward: quest.reward,
      locked: quest.locked ?? false,
      sort_order: index,
    })),
  );

  await upsert(
    'quest_steps',
    seedQuests.flatMap((quest) =>
      quest.steps.map((step, index) => ({
        id: step.id,
        quest_id: quest.id,
        label: step.label,
        seed_done: step.done,
        sort_order: index,
      })),
    ),
  );

  await upsert(
    'arrivals',
    seedArrivals.map((arrival, index) => ({
      id: `arr-${index}`,
      member_id: arrival.memberId,
      name: arrival.name,
      avatar: arrival.avatar,
      eta_mins: arrival.etaMins,
      seed: true,
    })),
  );

  await upsert(
    'quiz_questions',
    seedQuizQuestions.map((question, index) => ({
      id: question.id,
      prompt: question.prompt,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation,
      track: question.track,
      difficulty: question.difficulty,
      sort_order: index,
    })),
  );

  // ── Ideas ─────────────────────────────────────────────────────────────
  const nameToId = new Map<string, string>();
  for (const member of seedMembers) nameToId.set(member.name, member.id);
  nameToId.set(seedProfile.name, seedProfile.id);

  await upsert(
    'ideas',
    seedIdeas.map((idea) => ({
      id: idea.id,
      title: idea.title,
      body: idea.body,
      category: idea.category,
      anonymous: idea.anonymous,
      author_id: idea.authorName ? nameToId.get(idea.authorName) ?? null : null,
      author_name: idea.anonymous ? null : idea.authorName ?? null,
      author_avatar: idea.anonymous ? null : idea.authorAvatar ?? null,
      base_votes: idea.votes,
      status: idea.status,
      response: idea.response ?? null,
      responded_at: idea.respondedAt ?? null,
      created_at: idea.createdAt,
    })),
  );

  // ── Decisions ─────────────────────────────────────────────────────────
  await upsert(
    'decisions',
    seedDecisions.map((decision) => ({
      id: decision.id,
      title: decision.title,
      description: decision.description,
      status: decision.status,
      closes_at: decision.closesAt,
      quorum: decision.quorum,
      eligible_voters: decision.eligibleVoters,
      results_visible: decision.showResults,
      important: decision.important,
      created_at: decision.createdAt,
    })),
  );
  await upsert(
    'decision_options',
    seedDecisions.flatMap((decision) =>
      decision.options.map((option, index) => ({
        id: option.id,
        decision_id: decision.id,
        label: option.label,
        base_votes: option.votes,
        sort_order: index,
      })),
    ),
  );

  // ── Tasks ─────────────────────────────────────────────────────────────
  await upsert(
    'tasks',
    seedTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      points: task.points,
      due_at: task.dueAt ?? null,
      event_id: task.eventId ?? null,
      assignee_id: task.assigneeName ? nameToId.get(task.assigneeName) ?? null : null,
      assignee_name: task.assigneeName ?? null,
      assignee_avatar: task.assigneeAvatar ?? null,
      created_at: task.createdAt,
      completed_at: task.completedAt ?? null,
    })),
  );

  // ── Messenger ─────────────────────────────────────────────────────────
  await upsert(
    'conversations',
    seedConversations.map((conversation) => ({
      id: conversation.id,
      name: conversation.name,
      avatar: conversation.avatar ?? null,
      context: conversation.context ?? null,
      is_group: conversation.isGroup,
      participants: conversation.participants,
      online: conversation.online,
      pinned: conversation.pinned,
      last_message: conversation.lastMessage,
      last_message_at: conversation.lastMessageAt,
      base_unread: conversation.unreadCount,
    })),
  );

  const messageRows = Object.values(seedMessages)
    .flat()
    .map((message) => ({
      id: message.id,
      conversation_id: message.conversationId,
      author_id: message.isMine ? 'usr-you' : null,
      author_name: message.authorName,
      author_avatar: message.authorAvatar ?? null,
      body: message.body,
      sent_at: message.sentAt,
      delivery: message.delivery ?? 'sent',
      system: message.system ?? false,
    }));
  await upsert('messages', messageRows);

  // ── Notifications ─────────────────────────────────────────────────────
  await upsert(
    'notifications',
    seedNotifications.map((notification) => ({
      id: notification.id,
      member_id: null,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      created_at: notification.createdAt,
      deep_link: notification.deepLink ?? null,
    })),
  );

  const readRows = DEMO_ACCOUNTS.flatMap((account) =>
    seedNotifications
      .filter((notification) => notification.read)
      .map((notification) => ({
        member_id: account.memberId,
        notification_id: notification.id,
        read_at: new Date().toISOString(),
      })),
  );
  await upsert('notification_reads', readRows, 'member_id,notification_id');

  // Quiz streak for the demo accounts (matches the mock's starting streak).
  await upsert(
    'member_quiz_state',
    DEMO_ACCOUNTS.map((account) => ({
      member_id: account.memberId,
      streak: 6,
      awarded_date: null,
      perfect: false,
      updated_at: new Date().toISOString(),
    })),
    'member_id',
  );

  const { count } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true });
  console.log(`Done. ${count ?? 0} members on record.`);
}

main().catch((error) => {
  console.error('Seed failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
