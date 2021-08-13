import { GameHandler } from './game-handler';

import { Player } from '../../models/player';
import { NakamaError } from '../../models/error';

import { SERVER_MESSAGES } from '../../utils/constants';

export const gameInit = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    params: { [key: string]: string }
): { state: nkruntime.MatchState; tickRate: number; label: string } => {
    logger.info(`Init game match with params ${JSON.stringify(params)}`);

    return {
        state: GameHandler.initState(nk, params),
        tickRate: GameHandler.TICK_RATE,
        label: params.label,
    };
};

export const gameJoinAttempt = (
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

    const error: NakamaError | null = GameHandler.validateJoinAttempt(state, presence);

    if (error) return { state, accept: false, rejectMessage: error.toString() };

    return {
        state,
        accept: true,
    };
};

export const gameJoin = (
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

        state = GameHandler.addPlayer(dispatcher, state, p);

        const initialState = {
            level: state.level,
        };

        dispatcher.broadcastMessage(SERVER_MESSAGES.INITIAL_STATE, JSON.stringify(initialState), [p], null, true);
    });

    return {
        state,
    };
};

export const gameLeave = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: nkruntime.MatchState,
    presences: nkruntime.Presence[]
): { state: nkruntime.MatchState } | null => {
    presences.forEach(pr => {
        logger.debug(`${pr.username} left ${ctx.matchLabel} on ${tick} tick, userId: ${pr.userId}`);

        state.players = state.players.filter((pl: Player) => pl.presence.userId !== pr.userId);
        dispatcher.broadcastMessage(SERVER_MESSAGES.PLAYER_LEFT, JSON.stringify(pr), null, null, true);
    });

    return {
        state,
    };
};

export const gameLoop = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: nkruntime.MatchState,
    messages: nkruntime.MatchMessage[]
): { state: nkruntime.MatchState } | null => {
    state.lastActiveTick = state.players.length ? tick : state.lastActiveTick;

    if (GameHandler.shouldStop(tick, state.lastActiveTick, ctx.matchTickRate)) return null;

    messages.forEach(m => {
        state = GameHandler.handlePlayerMessage(logger, nk, dispatcher, state, m);
    });

    if (!state.playersInitialized && state.players.length === state.expectedPlayers && state.players.every((player: Player) => player.levelCreated))
        state = GameHandler.initializePlayers(state, dispatcher);

    if (!state.playersInitialized)
        return { state };

    state.networkIdentities = GameHandler.handleNetworkIdentitiesChanges(state.networkIdentities);
    let networkIdentitiesToSync = GameHandler.getNetworkIdentitiesToSync(tick, state.networkIdentities);

    if (networkIdentitiesToSync.length)
        dispatcher.broadcastMessage(SERVER_MESSAGES.STATE_UPDATE, JSON.stringify(networkIdentitiesToSync), null, null);

    return {
        state,
    };
};

export const gameTerminate = (
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
    dispatcher.broadcastMessage(SERVER_MESSAGES.MATCH_TERMINATED, message, null, null, true);

    return {
        state,
    };
};
