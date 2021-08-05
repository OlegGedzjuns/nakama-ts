const lobbyInit = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    params: { [key: string]: any }
): { state: nkruntime.MatchState; tickRate: number; label: string } => {
    logger.info(`Init lobby with params: ${JSON.stringify(params)}`);

    return {
        state: LobbyHandler.initState(params),
        tickRate: LobbyHandler.TICK_RATE,
        label: params.label,
    };
};

const lobbyJoinAttempt = (
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

    const error: NakamaError | null = LobbyHandler.validateJoinAttempt(state, presence);

    if (error) {
        return {
            state,
            accept: false,
            rejectMessage: error.toString(),
        };
    }

    return {
        state,
        accept: true,
    };
};

const lobbyJoin = (
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

        const initialState = {
            players: state.players,
        };

        dispatcher.broadcastMessage(MESSAGE_TYPES.LOBBY_INITIAL_STATE, JSON.stringify(initialState), [p], null, true);

        const player = new Player(p);
        state.players.push(player);
        dispatcher.broadcastMessage(MESSAGE_TYPES.LOBBY_JOINED, JSON.stringify(player.presence), null, null, true);
    });

    return {
        state,
    };
};

const lobbyLeave = (
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
        dispatcher.broadcastMessage(MESSAGE_TYPES.LOBBY_LEFT, JSON.stringify(pr), null, null, true);
    });

    return {
        state,
    };
};

const lobbyLoop = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: nkruntime.MatchState,
    messages: nkruntime.MatchMessage[]
): { state: nkruntime.MatchState } | null => {
    state.lastActiveTick = state.players.length ? tick : state.lastActiveTick;

    if (LobbyHandler.shouldStop(tick, ctx.matchTickRate, state.lastActiveTick)) {
        return null;
    }

    return {
        state,
    };
};

const lobbyTerminate = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: nkruntime.MatchState,
    graceSeconds: number
): { state: nkruntime.MatchState } | null => {
    logger.debug(`${ctx.matchLabel} terminated on ${tick} tick`);

    return {
        state,
    };
};
