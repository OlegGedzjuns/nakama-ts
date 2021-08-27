import { DemoHandler } from './demo-handler';

import { Player } from '../../models/player';

import { SERVER_MESSAGES } from '../../utils/constants';

export const init = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    params: { [key: string]: string }
): { state: nkruntime.MatchState; tickRate: number; label: string } => {
    logger.info(`Init game match with params ${JSON.stringify(params)}`);

    return {
        state: DemoHandler.initState(ctx, nk, logger, params),
        tickRate: DemoHandler.TICK_RATE,
        label: params.label,
    };
};

export const joinAttempt = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: nkruntime.MatchState,
    presence: nkruntime.Presence,
    metadata: { [key: string]: any }
): { state: nkruntime.MatchState; accept: boolean; rejectMessage?: string | undefined } | null => {
    return { state, accept: true }
};

export const join = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: nkruntime.MatchState,
    presences: nkruntime.Presence[]
): { state: nkruntime.MatchState } | null => {
    presences.forEach((p: nkruntime.Presence) => {
        logger.info(`${p.username} joined ${ctx.matchLabel} on ${tick} tick, userId: ${p.userId}`);

        state = DemoHandler.addPlayer(dispatcher, state, p);

        const initialState = { level: state.level };

        dispatcher.broadcastMessage(SERVER_MESSAGES.DEMO_INITIAL_STATE, JSON.stringify(initialState), [p], null, true);
    });

    return { state };
};

export const leave = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: nkruntime.MatchState,
    presences: nkruntime.Presence[]
): { state: nkruntime.MatchState } | null => {
    presences.forEach(pr => {
        logger.info(`${pr.username} left ${ctx.matchLabel} on ${tick} tick, userId: ${pr.userId}`);

        state = DemoHandler.removePlayer(dispatcher, state, pr);
    });

    return { state };
};

export const loop = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: nkruntime.MatchState,
    messages: nkruntime.MatchMessage[]
): { state: nkruntime.MatchState } | null => {
    state.lastActiveTick = state.players.length ? tick : state.lastActiveTick;

    if (DemoHandler.shouldStop(tick, state.lastActiveTick, ctx.matchTickRate)) {
        // https://github.com/playcanvas/engine/issues/3388#issuecomment-905528312
        // DemoHandler.getApp(ctx.matchId).destroy();
        return null;
    }

    DemoHandler.getApp(ctx.matchId).update(1 / ctx.matchTickRate);

    messages.forEach(m => {
        state = DemoHandler.handlePlayerMessage(logger, nk, dispatcher, state, m);
    });

    if (!state.playersInitialized && state.players.length === state.expectedPlayers && state.players.every((player: Player) => player.levelCreated))
        state = DemoHandler.initializePlayers(state, dispatcher);

    if (!state.playersInitialized)
        return { state };

    state.networkIdentities = DemoHandler.handleNetworkIdentitiesChanges(state.networkIdentities);
    let networkIdentitiesToSync = DemoHandler.getNetworkIdentitiesToSync(tick, state.networkIdentities);

    if (networkIdentitiesToSync.length)
        dispatcher.broadcastMessage(SERVER_MESSAGES.DEMO_STATE_UPDATE, JSON.stringify(networkIdentitiesToSync), null, null);

    return { state };
};

export const terminate = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: nkruntime.MatchState,
    graceSeconds: number
): { state: nkruntime.MatchState } | null => {
    logger.info(`${ctx.matchLabel} terminated on ${tick} tick`);

    return { state };
};
