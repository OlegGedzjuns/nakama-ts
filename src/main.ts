let InitModule: nkruntime.InitModule = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    initializer: nkruntime.Initializer
) {
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
