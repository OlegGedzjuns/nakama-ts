function rpcHealthcheck(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) : string {
  logger.info("Healthcheck RPC was called");
  return JSON.stringify({ success: true });
}
