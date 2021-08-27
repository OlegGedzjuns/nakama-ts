import * as Lobby from './matches/lobby-match/lobby';
import * as Game from './matches/game-match/game';

import { rpcCreateMatch } from './rpcs/match-service';
import { rpcLobbyInvite } from './rpcs/lobby-service';
import { rpcSaveLevel, rpcGetLevels } from './rpcs/storage-service';

let InitModule: nkruntime.InitModule = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    initializer: nkruntime.Initializer
) {
    initializer.registerMatch('lobby', {
        matchInit: Lobby.init,
        matchJoinAttempt: Lobby.joinAttempt,
        matchJoin: Lobby.join,
        matchLeave: Lobby.leave,
        matchLoop: Lobby.loop,
        matchTerminate: Lobby.terminate,
    });

    initializer.registerMatch('game', {
        matchInit: Game.init,
        matchJoinAttempt: Game.joinAttempt,
        matchJoin: Game.join,
        matchLeave: Game.leave,
        matchLoop: Game.loop,
        matchTerminate: Game.terminate,
    });

    initializer.registerRpc('createMatch', rpcCreateMatch);

    initializer.registerRpc('lobbyInvite', rpcLobbyInvite);

    initializer.registerRpc('saveLevel', rpcSaveLevel);
    initializer.registerRpc('getLevels', rpcGetLevels);
};

// Reference InitModule to avoid it getting removed on build
!InitModule && InitModule.bind(null);
