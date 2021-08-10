import { NakamaError } from "../../models/error";
import { Player } from "../../models/player";
import { PlayerActionParams } from "../../models/player-action";
import { CLIENT_MESSAGES, ERROR_TYPES, MATCH_TYPES, SERVER_MESSAGES } from "../../utils/constants";

export class LobbyHandler {
    static readonly SECONDS_WITHOUT_PLAYERS = 10;
    static readonly DEFAULT_MAX_PLAYERS = 3;
    static readonly TICK_RATE = 1;

    static initState(params: { [key: string]: any }) {
        const isPrivate: boolean = !!params.isPrivate ?? false;
        const maxPlayers: number = params.maxPlayers ?? this.DEFAULT_MAX_PLAYERS;
        const selectedLevel: string | null = null;
        const gameId: string | null = null;
        const players: Player[] = [];
        const lastActiveTick: number = 0;

        return { isPrivate, maxPlayers, selectedLevel, gameId, players, lastActiveTick };
    }

    static validateJoinAttempt(state: nkruntime.MatchState, presensce: nkruntime.Presence): NakamaError | null {
        if (state.players.length >= state.maxPlayers)
            return new NakamaError(ERROR_TYPES.LOBBY_FULL, 'Lobby is full');

        return null;
    }

    static handlePlayerMessage(
        logger: nkruntime.Logger,
        nk: nkruntime.Nakama,
        dispatcher: nkruntime.MatchDispatcher,
        state: nkruntime.MatchState,
        message: nkruntime.MatchMessage
    ): nkruntime.MatchState {
        for (let k of Object.keys(CLIENT_MESSAGES)) {
            if (CLIENT_MESSAGES[k].code == message.opCode) {
                return CLIENT_MESSAGES[k].action({ logger, nk, dispatcher, state, message });
            }
        }

        logger.warn('Cannot find player message action with code: ', message.opCode);

        return state;
    }

    static setLevel(data: PlayerActionParams): nkruntime.MatchState {
        const messageObject = JSON.parse(data.message.data);

        data.state.selectedLevel = messageObject.levelId;

        data.dispatcher.broadcastMessage(SERVER_MESSAGES.LOBBY_STATE_UPDATE, JSON.stringify({ selectedLevel: data.state.selectedLevel }), null, null, true);

        return data.state;
    }

    static startMatch(data: PlayerActionParams): nkruntime.MatchState {
        const messageObject = JSON.parse(data.message.data);

        data.logger.warn(data.message.data);

        data.state.gameId = data.nk.matchCreate(MATCH_TYPES.GAME, messageObject);

        data.dispatcher.broadcastMessage(SERVER_MESSAGES.LOBBY_GAME_STARTED, JSON.stringify({ gameId: data.state.gameId }), null, null, true);

        return data.state;
    }

    static shouldStop(tick: number, tickRate: number, lastTickWithPlayers: number): boolean {
        return (tick - lastTickWithPlayers) / tickRate >= this.SECONDS_WITHOUT_PLAYERS;
    }
}
