class LobbyHandler {
    static readonly SECONDS_WITHOUT_PLAYERS = 10;
    static readonly DEFAULT_MAX_PLAYERS = 5;

    static initState(params: { [key: string]: any }) {
        const isPrivate: boolean = !!params.isPrivate ?? false;
        const maxPlayers: number = params.maxPlayers ?? this.DEFAULT_MAX_PLAYERS;
        const players: Player[] = [];
        const lastActiveTick: number = 0;

        return { isPrivate, maxPlayers, players, lastActiveTick };
    }

    static validateJoinAttempt(state: nkruntime.MatchState, presensce: nkruntime.Presence): NakamaError | null {
        if (state.players.length >= state.maxPlayers) {
            return new NakamaError(ERROR_TYPES.LOBBY_FULL, 'Lobby is full');
        }

        return null;
    }

    static shouldStop(tick: number, tickRate: number, lastTickWithPlayers: number): boolean {
        return (tick - lastTickWithPlayers) / tickRate >= this.SECONDS_WITHOUT_PLAYERS;
    }
}
