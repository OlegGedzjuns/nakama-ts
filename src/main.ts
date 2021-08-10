import { Vec3 } from "./libs/playcanvas";
import { gameInit, gameJoin, gameJoinAttempt, gameLeave, gameLoop, gameTerminate } from "./matches/game-match/game";
import { lobbyInit, lobbyJoin, lobbyJoinAttempt, lobbyLeave, lobbyLoop, lobbyTerminate } from "./matches/lobby-match/lobby";
import { rpcLobbyInvite } from "./rpcs/lobby-service";
import { rpcCreateMatch } from "./rpcs/match-service";
import { rpcSaveLevel, rpGetLevels } from "./rpcs/storage-service";

let InitModule: nkruntime.InitModule = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    initializer: nkruntime.Initializer
) {
    const vec = Vec3.ONE.clone();

    logger.debug(vec.toString());

    initializer.registerMatch('lobby', {
        matchInit: lobbyInit,
        matchJoinAttempt: lobbyJoinAttempt,
        matchJoin: lobbyJoin,
        matchLeave: lobbyLeave,
        matchLoop: lobbyLoop,    
        matchTerminate: lobbyTerminate,
    });

    initializer.registerMatch('game', {
        matchInit: gameInit,
        matchJoinAttempt: gameJoinAttempt,
        matchJoin: gameJoin,
        matchLeave: gameLeave,
        matchLoop: gameLoop,
        matchTerminate: gameTerminate,
    });

    initializer.registerRpc('createMatch', rpcCreateMatch);

    initializer.registerRpc('saveLevel', rpcSaveLevel);
    initializer.registerRpc('getLevels', rpGetLevels);

    initializer.registerRpc('lobbyInvite', rpcLobbyInvite);
};

// Reference InitModule to avoid it getting removed on build
!InitModule && InitModule.bind(null);
