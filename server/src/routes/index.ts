import { Router } from 'express';

import { authRouter } from './auth';
import { eventsRouter } from './events';
import { membersRouter } from './members';
import { resourcesRouter } from './resources';
import { communityRouter } from './community';
import { achievementsRouter } from './achievements';
import { squadsRouter } from './squads';
import { questsRouter } from './quests';
import { presenceRouter } from './presence';
import { quizzesRouter } from './quizzes';
import { ideasRouter } from './ideas';
import { decisionsRouter } from './decisions';
import { statsRouter } from './stats';
import { tasksRouter } from './tasks';
import { messagesRouter } from './messages';
import { notificationsRouter } from './notifications';
import { profileRouter } from './profile';
import { adminRouter } from './admin';

/** Every router shares one surface; auth is applied per-route. */
export const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use(eventsRouter);
apiRouter.use(membersRouter);
apiRouter.use(resourcesRouter);
apiRouter.use(communityRouter);
apiRouter.use(achievementsRouter);
apiRouter.use(squadsRouter);
apiRouter.use(questsRouter);
apiRouter.use(presenceRouter);
apiRouter.use(quizzesRouter);
apiRouter.use(ideasRouter);
apiRouter.use(decisionsRouter);
apiRouter.use(statsRouter);
apiRouter.use(tasksRouter);
apiRouter.use(messagesRouter);
apiRouter.use(notificationsRouter);
apiRouter.use(profileRouter);
apiRouter.use(adminRouter);
