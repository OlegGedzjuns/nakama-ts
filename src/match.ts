const generateCoins = (numberOfCoins: number, width: number): Coin[] => {
  const coins: Coin[] = [];

  for (let i: number = 0; i < numberOfCoins; i++) {
    coins.push(new Coin(i, width));
  }

  return coins;
};

const matchInit = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  params: { [key: string]: string }
): { state: nkruntime.MatchState; tickRate: number; label: string } => {
  logger.debug(`Init match with params ${JSON.stringify(params)}`);

  const coins: Coin[] = generateCoins(parseInt(params.numberOfCoins), parseInt(params.width));
  const players: Player[] = [];

  return {
    state: { coins, players, lastPlayersTick: 0 },
    tickRate: 1,
    label: "Test match",
  };
};

const matchJoinAttempt = (
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

  return {
    state,
    accept: true,
  };
};

const matchJoin = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  presences: nkruntime.Presence[]
): { state: nkruntime.MatchState } | null => {
  presences.forEach((p) => {
    logger.debug(`${p.username} joined ${ctx.matchLabel} on ${tick} tick, userId: ${p.userId}`);

    const player = new Player(p.userId, p.username);
    state.players.push(player);
    dispatcher.broadcastMessage(MessageType.SERVER_PLAYER_JOINED, JSON.stringify(player), null, null, true);
  });

  dispatcher.broadcastMessage(MessageType.SERVER_PLAYER_JOINED_INITIAL_STATE, JSON.stringify(state), presences, null, true);

  return {
    state,
  };
};

const matchLeave = (
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

    state.players = state.players.filter((pl: Player) => pl.id !== pr.userId);
    dispatcher.broadcastMessage(MessageType.SERVER_PLAYER_LEFT, JSON.stringify(pr.userId), null, null, true);
  });

  return {
    state,
  };
};

const matchLoop = (
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

  state.lastPlayersTick = state.players.length ? tick : state.lastPlayersTick;

  if (tick - state.lastPlayersTick > 10) {
    // somehow terminate match
  }

  return {
    state,
  };
};

const matchTerminate = (
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
