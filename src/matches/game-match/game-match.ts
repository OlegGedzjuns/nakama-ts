const GAME_MATCH_SECONDS_WITHOUT_PLAYERS = 60;

const gameMatchInit = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  params: { [key: string]: string }
): { state: nkruntime.MatchState; tickRate: number; label: string } => {
  logger.info(`Init match with params ${JSON.stringify(params)}`);

  const players: Player[] = [];
  const lastActiveTick: number = 0;

  return {
    state: { players, lastActiveTick },
    tickRate: parseInt(params.tickRate),
    label: params.label,
  };
};

const gameMatchJoinAttempt = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  presence: nkruntime.Presence,
  metadata: { [key: string]: any }
): { state: nkruntime.MatchState; accept: boolean; rejectMessage?: string | undefined } | null => {
  logger.debug(`${presence.username} attempted to join ${ctx.matchLabel} on ${tick} tick, userId: ${presence.userId}`);

  if (presence.username.indexOf('o') !== -1) {
    return {
      state,
      accept: false,
      rejectMessage: 'Wrong nickname',
    };
  }

  return {
    state,
    accept: true,
  };
};

const gameMatchJoin = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  presences: nkruntime.Presence[]
): { state: nkruntime.MatchState } | null => {
  presences.forEach((p: nkruntime.Presence) => {
    logger.debug(`${p.username} joined ${ctx.matchLabel} on ${tick} tick, userId: ${p.userId}`);

    const player = new Player(p);
    state.players.push(player);
    state.presences.push(p);
    dispatcher.broadcastMessage(MessageType.SERVER_PLAYER_JOINED, JSON.stringify(player), null, null, true);
    dispatcher.broadcastMessage(MessageType.SERVER_PLAYER_JOINED_INITIAL_STATE, JSON.stringify(player), [p], null, true);
  });

  return {
    state,
  };
};

const gameMatchLeave = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  presences: nkruntime.Presence[]
): { state: nkruntime.MatchState } | null => {
  presences.forEach((pr) => {
    logger.debug(`${pr.username} left ${ctx.matchLabel} on ${tick} tick, userId: ${pr.userId}`);

    state.players = state.players.filter((pl: Player) => pl.presence.userId !== pr.userId);
    state.presences = state.presences.filter((p: nkruntime.Presence) => p.userId !== pr.userId);
    dispatcher.broadcastMessage(MessageType.SERVER_PLAYER_LEFT, JSON.stringify(pr.userId), null, null, true);
  });

  return {
    state,
  };
};

const gameMatchLoop = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  messages: nkruntime.MatchMessage[]
): { state: nkruntime.MatchState } | null => {
  messages.forEach((m) => {
    logger.info(`Received ${m.data} from ${m.sender.userId}`);
    dispatcher.broadcastMessage(MessageType.SERVER_PLAYER_MESSAGE, m.data, null, m.sender);
  });

  state.lastActiveTick = state.players.length ? tick : state.lastActiveTick;

  if ((tick - state.lastActiveTick) / ctx.matchTickRate >= GAME_MATCH_SECONDS_WITHOUT_PLAYERS) {
    return null;
  }

  return {
    state,
  };
};

const gameMatchTerminate = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  graceSeconds: number
): { state: nkruntime.MatchState } | null => {
  logger.debug(`${ctx.matchLabel} terminated on ${tick} tick`);

  const message = `Server shutting down in ${graceSeconds} seconds.`;
  dispatcher.broadcastMessage(MessageType.SERVER_TERMINATED, message, null, null, true);

  return {
    state,
  };
};
