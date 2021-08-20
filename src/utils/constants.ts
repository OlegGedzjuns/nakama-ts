import { GameHandler } from '../matches/game-match/game-handler';
import { LobbyHandler } from '../matches/lobby-match/lobby-handler';

import { ClientActionFunction, ClientActionParams } from '../models/client-action';

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
    STATE_UPDATE: 104,
    CREATE_ENTITIES: 105,
};

export const CLIENT_MESSAGES: { [key: string]: { code: number; action: ClientActionFunction } } = {
    LOBBY_SET_LEVEL: { code: 1, action: (data: ClientActionParams) => LobbyHandler.setLevel(data) },
    LOBBY_START_GAME: { code: 2, action: (data: ClientActionParams) => LobbyHandler.startGame(data) },
    LOBBY_SET_IS_READY: { code: 3, action: (data: ClientActionParams) => LobbyHandler.setIsReady(data) },

    PLAYER_MOVEMENT: { code: 101, action: (data: ClientActionParams) => GameHandler.movePlayer(data) },
    LEVEL_INITIALIZED: { code: 102, action: (data: ClientActionParams) => GameHandler.playerLevelInitialized(data) },
};

export const NOTIFICATION_TYPES = {
    LOBBY_INVITE: 1,
};

export const ERROR_TYPES = {
    LOBBY_FULL: 1,
    WRONG_PARAMS: 2,
};

// https://github.com/heroiclabs/nakama/issues/657
export const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
