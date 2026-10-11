import type {
  ActivityItem,
  Announcement,
  AppNotification,
  Badge,
  ChatMessage,
  Conversation,
  Decision,
  GdgEvent,
  Idea,
  Member,
  MemberRole,
  Quest,
  Resource,
  ResourceProgress,
  Squad,
  Task,
  UserProfile,
} from './types';
import type {
  ActivityRow,
  AnnouncementRow,
  BadgeRow,
  ConversationRow,
  DecisionOptionRow,
  DecisionRow,
  EventRow,
  IdeaRow,
  MemberRow,
  MessageRow,
  NotificationRow,
  QuestRow,
  QuestStepRow,
  ResourceRow,
  SquadRow,
  TaskRow,
} from './db-types';

const opt = <T>(value: T | null | undefined): T | undefined =>
  value === null || value === undefined ? undefined : value;

export function toMember(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    headline: row.headline,
    bio: row.bio,
    avatar: row.avatar,
    online: row.online,
    skills: row.skills ?? [],
    socials: row.socials ?? {},
    mutualEvents: row.mutual_events,
    projects: row.projects ?? [],
    badges: row.badges,
    points: row.points,
    eventsAttended: row.events_attended,
  };
}

export function toProfile(row: MemberRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    headline: row.headline,
    bio: row.bio,
    avatar: row.avatar,
    role: row.role,
    skills: row.skills ?? [],
    socials: row.socials ?? {},
    points: row.points,
    tier: row.tier,
    eventsAttended: row.events_attended,
    workshops: row.workshops,
    badges: row.badges,
    joinedAt: row.joined_at,
  };
}

export function toEvent(row: EventRow): GdgEvent {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    description: row.description,
    category: row.category,
    track: row.track,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    durationLabel: row.duration_label,
    location: row.location,
    venue: row.venue,
    capacity: row.capacity,
    registeredCount: row.registered_count,
    coverImage: row.cover_image,
    speaker: opt(row.speaker),
    featured: row.featured,
    flagship: row.flagship,
    prize: opt(row.prize),
    highlights: row.highlights ?? [],
    perks: opt(row.perks),
    agenda: opt(row.agenda),
    organizerNote: opt(row.organizer_note),
  };
}

export function toResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    description: row.description,
    type: row.type,
    category: row.category,
    difficulty: row.difficulty,
    technologies: row.technologies ?? [],
    durationMins: row.duration_mins,
    author: row.author,
    coverImage: row.cover_image,
    url: row.url,
    points: row.points,
  };
}

export function toAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tag: row.tag,
    deadline: opt(row.deadline),
    createdAt: row.created_at,
    ctaLabel: opt(row.cta_label),
    ctaLink: opt(row.cta_link),
    pinned: row.pinned,
  };
}

export function toActivity(row: ActivityRow): ActivityItem {
  return {
    id: row.id,
    kind: row.kind,
    actor: row.actor,
    action: row.action,
    target: opt(row.target),
    targetId: opt(row.target_id),
    meta: opt(row.meta),
    stars: opt(row.stars),
    createdAt: row.created_at,
  };
}

export function toNotification(row: NotificationRow, read: boolean): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    read,
    deepLink: opt(row.deep_link),
  };
}

export function toBadge(
  row: BadgeRow,
  unlocked: boolean,
  unlockedAt?: string | null,
): Badge {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    points: row.points,
    rarity: row.rarity,
    unlocked,
    unlockedAt: unlocked ? opt(unlockedAt) : undefined,
    progress: unlocked ? 100 : 0,
    progressLabel: unlocked ? 'Unlocked' : 'Locked',
  };
}

export function toSquad(
  row: SquadRow,
  extras: { rank: number; gapToNext: number; isMine: boolean },
): Squad {
  return {
    id: row.id,
    name: row.name,
    track: row.track,
    emblem: row.emblem,
    tagline: row.tagline,
    memberCount: row.member_count,
    squadXp: row.squad_xp,
    weekXp: row.week_xp,
    rank: extras.rank,
    isMine: extras.isMine,
    gapToNext: extras.gapToNext,
  };
}

export function toQuest(
  row: QuestRow,
  steps: QuestStepRow[],
  doneStepIds: Set<string>,
  claimed: boolean,
): Quest {
  const mappedSteps = steps.map((step) => ({
    id: step.id,
    label: step.label,
    done: step.seed_done || doneStepIds.has(step.id),
  }));
  const doneCount = mappedSteps.filter((step) => step.done).length;
  const progress = mappedSteps.length ? doneCount / mappedSteps.length : 0;
  const status: Quest['status'] = row.locked
    ? 'locked'
    : claimed
      ? 'claimed'
      : mappedSteps.length > 0 && doneCount === mappedSteps.length
        ? 'claimable'
        : 'active';
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    track: opt(row.track),
    reward: row.reward,
    steps: mappedSteps,
    status,
    claimed,
    progress,
  };
}

export function toIdea(row: IdeaRow, voted: boolean, isMine: boolean): Idea {
  const anonymous = row.anonymous;
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    anonymous,
    authorName: anonymous ? undefined : opt(row.author_name),
    authorAvatar: anonymous ? undefined : opt(row.author_avatar),
    votes: row.base_votes + (voted ? 1 : 0),
    voted,
    status: row.status,
    response: opt(row.response),
    respondedAt: opt(row.responded_at),
    createdAt: row.created_at,
    isMine,
  };
}

export function toDecision(
  row: DecisionRow,
  options: DecisionOptionRow[],
  myVoteOptionId: string | undefined,
): Decision {
  const mappedOptions = options.map((option) => ({
    id: option.id,
    label: option.label,
    votes: option.base_votes + (myVoteOptionId === option.id ? 1 : 0),
  }));
  const totalVotes = options.reduce((sum, option) => sum + option.base_votes, 0) + (myVoteOptionId ? 1 : 0);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    options: mappedOptions,
    status: row.status,
    closesAt: row.closes_at,
    quorum: row.quorum,
    totalVotes,
    eligibleVoters: row.eligible_voters,
    myVoteOptionId,
    resultsVisible: row.results_visible || row.status === 'closed' || Boolean(myVoteOptionId),
    important: row.important,
    createdAt: row.created_at,
  };
}

export function toTask(
  row: TaskRow,
  extras: { isMine: boolean; eventTitle?: string },
): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    points: row.points,
    dueAt: opt(row.due_at),
    eventId: opt(row.event_id),
    eventTitle: extras.eventTitle,
    assigneeName: opt(row.assignee_name),
    assigneeAvatar: opt(row.assignee_avatar),
    isMine: extras.isMine,
    createdAt: row.created_at,
    completedAt: opt(row.completed_at),
  };
}

export function toConversation(
  row: ConversationRow,
  extras: { lastMessage: string; lastMessageAt: string; unreadCount: number },
): Conversation {
  return {
    id: row.id,
    name: row.name,
    avatar: opt(row.avatar),
    context: opt(row.context),
    isGroup: row.is_group,
    participants: row.participants,
    online: row.online,
    pinned: row.pinned,
    lastMessage: extras.lastMessage,
    lastMessageAt: extras.lastMessageAt,
    unreadCount: extras.unreadCount,
  };
}

export function toMessage(row: MessageRow, memberId: string): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    authorName: row.author_name,
    authorAvatar: opt(row.author_avatar),
    body: row.body,
    sentAt: row.sent_at,
    isMine: row.author_id === memberId,
    delivery: (row.delivery as ChatMessage['delivery']) ?? 'sent',
    system: row.system || undefined,
  };
}

export function toResourceProgress(value: string | undefined): ResourceProgress {
  return value === 'started' || value === 'completed' ? value : 'none';
}

export function roleOf(value: string): MemberRole {
  return value as MemberRole;
}
