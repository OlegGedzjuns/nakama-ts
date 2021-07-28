let InitModule: nkruntime.InitModule = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  // Register the match handler
  initializer.registerMatch("test-match", {
    matchInit,
    matchJoinAttempt,
    matchJoin,
    matchLoop,
    matchLeave,
    matchTerminate,
  });

  initializer.registerRpc("createMatch", rpcCreateMatch);
};
