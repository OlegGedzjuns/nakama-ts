const gameMatchInit = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    params: { [key: string]: string }
): { state: nkruntime.MatchState; tickRate: number; label: string } => {
    logger.info(`Init match with params ${JSON.stringify(params)}`);

    const [level, networkIdentities] = GameMatchHandler.initializeLevel(nk, params.levelId);
    const players: Player[] = [];
    const lastActiveTick: number = 0;

    return {
        state: { level, networkIdentities, players, lastActiveTick },
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

    const rejectMessage = GameMatchHandler.validateUsername(presence.username);

    if (rejectMessage) {
        return {
            state,
            accept: false,
            rejectMessage,
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
        dispatcher.broadcastMessage(MESSAGE_TYPES.PLAYER_JOINED, JSON.stringify(player), null, null, true);

        const initialState = {
            level: state.level,
            networkIdentities: state.networkIdentities,
        };

        dispatcher.broadcastMessage(MESSAGE_TYPES.INITIAL_STATE, JSON.stringify(initialState), [p], null, true);
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
        dispatcher.broadcastMessage(MESSAGE_TYPES.PLAYER_LEFT, JSON.stringify(pr.username), null, null, true);
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
        dispatcher.broadcastMessage(MESSAGE_TYPES.PLAYER_MESSAGE, m.data, null, m.sender);
    });

    state.lastActiveTick = state.players.length ? tick : state.lastActiveTick;

    if (GameMatchHandler.shouldStop(tick, state.lastActiveTick, ctx.matchTickRate)) {
        return null;
    }

    state.networkIdentities = GameMatchHandler.handleNetworkIdentitiesChanges(state.networkIdentities);
    let networkIdentitiesToSync = GameMatchHandler.getNetworkIdentitiesToSync(tick, state.networkIdentities);

    if (networkIdentitiesToSync.length) {
        dispatcher.broadcastMessage(MESSAGE_TYPES.STATE_UPDATE, JSON.stringify(networkIdentitiesToSync), null, null);
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
    dispatcher.broadcastMessage(MESSAGE_TYPES.MATCH_TERMINATED, message, null, null, true);

    return {
        state,
    };
};
