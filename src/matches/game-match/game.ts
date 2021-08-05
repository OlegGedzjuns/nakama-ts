const gameInit = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    params: { [key: string]: string }
): { state: nkruntime.MatchState; tickRate: number; label: string } => {
    logger.info(`Init game match with params ${JSON.stringify(params)}`);

    const [level, networkIdentities] = GameHandler.initializeLevel(nk, params.levelId);
    const players: Player[] = [];
    const lastActiveTick: number = 0;

    return {
        state: { level, networkIdentities, players, lastActiveTick },
        tickRate: parseInt(params.tickRate),
        label: params.label,
    };
};

const gameJoinAttempt = (
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

    const rejectMessage = GameHandler.validateUsername(presence.username);

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

const gameJoin = (
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
        dispatcher.broadcastMessage(MESSAGE_TYPES.PLAYER_JOINED, JSON.stringify(player.presence), null, null, true);

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

const gameLeave = (
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
        dispatcher.broadcastMessage(MESSAGE_TYPES.PLAYER_LEFT, JSON.stringify(pr), null, null, true);
    });

    return {
        state,
    };
};

const gameLoop = (
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

    if (GameHandler.shouldStop(tick, state.lastActiveTick, ctx.matchTickRate)) {
        return null;
    }

    state.networkIdentities = GameHandler.handleNetworkIdentitiesChanges(state.networkIdentities);
    let networkIdentitiesToSync = GameHandler.getNetworkIdentitiesToSync(tick, state.networkIdentities);

    if (networkIdentitiesToSync.length) {
        dispatcher.broadcastMessage(MESSAGE_TYPES.STATE_UPDATE, JSON.stringify(networkIdentitiesToSync), null, null);
    }

    return {
        state,
    };
};

const gameTerminate = (
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
