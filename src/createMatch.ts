function rpcCreateMatch(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
  const matchId = nk.matchCreate("test-match", JSON.parse(payload));
  return JSON.stringify({ matchId });
}
