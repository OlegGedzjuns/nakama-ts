let InitModule: nkruntime.InitModule = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    initializer: nkruntime.Initializer
) {
    initializer.registerMatch('game-match', {
        matchInit: gameMatchInit,
        matchJoinAttempt: gameMatchJoinAttempt,
        matchJoin: gameMatchJoin,
        matchLeave: gameMatchLeave,
        matchLoop: gameMatchLoop,
        matchTerminate: gameMatchTerminate,
    });

    initializer.registerRpc('createMatch', rpcCreateMatch);
};
