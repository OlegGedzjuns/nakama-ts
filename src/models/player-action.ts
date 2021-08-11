export interface PlayerActionFunction {
    (params: PlayerActionParams): nkruntime.MatchState;
}

export interface PlayerActionParams {
    logger: nkruntime.Logger;
    nk: nkruntime.Nakama;
    dispatcher: nkruntime.MatchDispatcher;
    state: nkruntime.MatchState;
    message: nkruntime.MatchMessage;
}
