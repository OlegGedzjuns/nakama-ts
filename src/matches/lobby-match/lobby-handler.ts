import { NakamaError } from '../../models/error';
import { Player } from '../../models/player';
import { ClientActionParams } from '../../models/client-action';

import { CLIENT_MESSAGES, ERROR_TYPES, MATCH_TYPES, SERVER_MESSAGES } from '../../utils/constants';

export class LobbyHandler {
    public static readonly TICK_RATE = 1;

    private static readonly SECONDS_WITHOUT_PLAYERS = 10;
    private static readonly DEFAULT_MAX_PLAYERS = 3;

    public static initState(params: { [key: string]: any }) {
        const isPrivate: boolean = !!params.isPrivate ?? false;
        const maxPlayers: number = params.maxPlayers ?? this.DEFAULT_MAX_PLAYERS;
        const ownerId: string | null = null;
        const selectedLevel: string | null = null;
        const gameId: string | null = null;
        const players: (Player | null)[] = [];

        for(let i = 0; i < this.DEFAULT_MAX_PLAYERS; i++) {
            players.push(null);
        }

        const lastActiveTick: number = 0;

        return { isPrivate, maxPlayers, ownerId, selectedLevel, gameId, players, lastActiveTick };
    }

    public static validateJoinAttempt(state: nkruntime.MatchState, presensce: nkruntime.Presence): NakamaError | null {
        if (state.players.filter((p : Player | null) => p).length >= state.maxPlayers)
            return new NakamaError(ERROR_TYPES.LOBBY_FULL, 'Lobby is full');

        return null;
    }

    public static addPlayer(dispatcher: nkruntime.MatchDispatcher, state: nkruntime.MatchState, presence: nkruntime.Presence): nkruntime.MatchState {
        if (state.players.filter((p : Player | null) => p).length == 0)
            state.ownerId = presence.userId;

        const initialState = {
            players: state.players,
            selectedLevel: state.selectedLevel,
            gameId: state.gameId,
            ownerId: state.ownerId,
        };

        dispatcher.broadcastMessage(SERVER_MESSAGES.LOBBY_INITIAL_STATE, JSON.stringify(initialState), [presence], null, true);

        const player = new Player(presence);

        const emptyIndex = state.players.findIndex((p: Player | null) => !p);

        state.players[emptyIndex] = player;

        dispatcher.broadcastMessage(
            SERVER_MESSAGES.LOBBY_JOINED,
            JSON.stringify({
                presence: player.presence,
                isOwner: state.ownerId == presence.userId,
                isReady: player.isReady,
                position: emptyIndex,
            }),
            null,
            null,
            true
        );

        return state;
    }

    public static removePlayer(dispatcher: nkruntime.MatchDispatcher, state: nkruntime.MatchState, presence: nkruntime.Presence): nkruntime.MatchState {
        for (let i = 0; i < this.DEFAULT_MAX_PLAYERS; i++) {
            if (state.players[i] && state.players[i].presence.userId == presence.userId) {
                state.players[i] = null;
                break;
            }
        }

        if (presence.userId == state.ownerId) {
            for (let i = 0; i < this.DEFAULT_MAX_PLAYERS; i++) {
                if (state.players[i]) {
                    state.ownerId = state.players[i].presence.userId;
                    [state.players[0], state.players[i]] = [state.players[i], state.players[0]];
                    break;
                }
            }
        }

        const message = { presence: presence, ownerId: state.ownerId, order: state.players.map((p: Player | null) => p?.presence.userId) };

        dispatcher.broadcastMessage(SERVER_MESSAGES.LOBBY_LEFT, JSON.stringify(message), null, null, true);

        return state;
    }

    public static handlePlayerMessage(
        logger: nkruntime.Logger,
        nk: nkruntime.Nakama,
        dispatcher: nkruntime.MatchDispatcher,
        state: nkruntime.MatchState,
        message: nkruntime.MatchMessage
    ): nkruntime.MatchState {        
        for (let k of Object.keys(CLIENT_MESSAGES)) {
            if (CLIENT_MESSAGES[k].code == message.opCode) return CLIENT_MESSAGES[k].action({ logger, nk, dispatcher, state, message });
        }

        logger.warn('Cannot find player message action with code: ', message.opCode);

        return state;
    }

    public static setLevel(data: ClientActionParams): nkruntime.MatchState {
        if (data.message.sender.userId != data.state.ownerId)
            return data.state;

        const messageObject = JSON.parse(data.message.data);

        data.state.selectedLevel = messageObject.levelId;

        data.dispatcher.broadcastMessage(
            SERVER_MESSAGES.LOBBY_STATE_UPDATE,
            JSON.stringify({ selectedLevel: data.state.selectedLevel }),
            null,
            null,
            true
        );

        return data.state;
    }

    public static startGame(data: ClientActionParams, matchType: string): nkruntime.MatchState {
        if (data.message.sender.userId != data.state.ownerId)
            return data.state;

        if (data.state.players.some((p: Player | null) => p && p.presence.userId != data.state.ownerId && !p.isReady))
            return data.state;

        const messageObject = JSON.parse(data.message.data);

        messageObject.expectedPlayers = data.state.players.filter((p: Player | null) => !!p).length;

        data.state.gameId = data.nk.matchCreate(matchType, messageObject);

        data.dispatcher.broadcastMessage(SERVER_MESSAGES.LOBBY_GAME_STARTED, JSON.stringify({ gameId: data.state.gameId, matchType }), null, null, true);

        return data.state;
    }

    public static setIsReady(data: ClientActionParams): nkruntime.MatchState {
        const messageObject = JSON.parse(data.message.data);

        const player: Player = data.state.players.find((p: Player | null) => p && p.presence.userId == data.message.sender.userId);

        player.isReady = messageObject.isReady;

        data.dispatcher.broadcastMessage(
            SERVER_MESSAGES.LOBBY_STATE_UPDATE,
            JSON.stringify({ playerReady: { username: player.presence.username, userId: player.presence.userId, isReady: player.isReady } }),
            null,
            null,
            true
        );

        return data.state;
    }

    public static shouldStop(tick: number, tickRate: number, lastTickWithPlayers: number): boolean {
        return (tick - lastTickWithPlayers) / tickRate >= this.SECONDS_WITHOUT_PLAYERS;
    }
}
