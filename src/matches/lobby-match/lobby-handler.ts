class LobbyHandler {
    static readonly SECONDS_WITHOUT_PLAYERS = 10;

    static shouldStop(tick: number, lastTickWithPlayers: number, tickRate: number): boolean {
        return (tick - lastTickWithPlayers) / tickRate >= this.SECONDS_WITHOUT_PLAYERS;
    }
}
