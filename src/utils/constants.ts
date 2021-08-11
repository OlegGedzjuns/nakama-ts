import { LobbyHandler } from '../matches/lobby-match/lobby-handler';

import { PlayerActionFunction, PlayerActionParams } from '../models/player-action';

export const MATCH_TYPES = {
    LOBBY: 'lobby',
    GAME: 'game',
};

export const SERVER_MESSAGES = {
    LOBBY_JOINED: 1,
    LOBBY_LEFT: 2,
    LOBBY_INITIAL_STATE: 3,
    LOBBY_STATE_UPDATE: 4,
    LOBBY_GAME_STARTED: 5,

    PLAYER_JOINED: 101,
    INITIAL_STATE: 102,
    PLAYER_LEFT: 103,
    PLAYER_MESSAGE: 104,
    MATCH_TERMINATED: 105,
    STATE_UPDATE: 106,
};

export const CLIENT_MESSAGES: { [key: string]: { code: number; action: PlayerActionFunction } } = {
    LOBBY_SET_LEVEL: { code: 1, action: (data: PlayerActionParams) => LobbyHandler.setLevel(data) },
    LOBBY_START_GAME: { code: 2, action: (data: PlayerActionParams) => LobbyHandler.startGame(data) },
};

export const NOTIFICATION_TYPES = {
    LOBBY_INVITE: 1,
};

export const ERROR_TYPES = {
    LOBBY_FULL: 1,
    WRONG_PARAMS: 2,
    INVALID_USERNAME: 3,
};

// https://github.com/heroiclabs/nakama/issues/657
export const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
