import { LobbyHandler } from './lobby-handler';

import { NakamaError } from '../../models/error';

export const lobbyInit = (
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

export const lobbyJoinAttempt = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: nkruntime.MatchState,
    presence: nkruntime.Presence,
    metadata: { [key: string]: any }
): { state: nkruntime.MatchState; accept: boolean; rejectMessage?: string | undefined } | null => {
    logger.info(`${presence.username} attempted to join ${ctx.matchLabel} on ${tick} tick, userId: ${presence.userId}`);

    const error: NakamaError | null = LobbyHandler.validateJoinAttempt(state, presence);

    if (error)
        return { state, accept: false, rejectMessage: error.toString() };

    return { state, accept: true };
};

export const lobbyJoin = (
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

        state = LobbyHandler.addPlayer(dispatcher, state, p);
    });

    return { state };
};

export const lobbyLeave = (
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

        state = LobbyHandler.removePlayer(dispatcher, state, pr);
    });

    return { state };
};

export const lobbyLoop = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: nkruntime.MatchState,
    messages: nkruntime.MatchMessage[]
): { state: nkruntime.MatchState } | null => {
    state.lastActiveTick = state.players.length ? tick : state.lastActiveTick;

    if (LobbyHandler.shouldStop(tick, ctx.matchTickRate, state.lastActiveTick)) return null;

    messages.forEach(m => {
        logger.info(`Received ${m.data} from ${m.sender.userId}`);

        state = LobbyHandler.handlePlayerMessage(logger, nk, dispatcher, state, m);
    });

    return { state };
};

export const lobbyTerminate = (
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
