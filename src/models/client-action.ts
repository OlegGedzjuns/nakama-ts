export interface ClientActionFunction {
    (params: ClientActionParams): nkruntime.MatchState;
}

export interface ClientActionParams {
    logger: nkruntime.Logger;
    nk: nkruntime.Nakama;
    dispatcher: nkruntime.MatchDispatcher;
    state: nkruntime.MatchState;
    message: nkruntime.MatchMessage;
}
