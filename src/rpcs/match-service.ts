function rpcCreateMatch(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    const payloadObject = JSON.parse(payload);
    const matchId = nk.matchCreate(payloadObject.matchType, payloadObject.settings);
    return JSON.stringify({ matchId });
}
