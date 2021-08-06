interface PlayerActionFunction {
    (params: PlayerActionParams): nkruntime.MatchState;
}

interface PlayerActionParams {
    logger: nkruntime.Logger,
    dispatcher: nkruntime.MatchDispatcher,
    state: nkruntime.MatchState,
    message: nkruntime.MatchMessage,
}
