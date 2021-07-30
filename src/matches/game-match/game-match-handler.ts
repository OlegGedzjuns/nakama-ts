const GAME_MATCH_SECONDS_WITHOUT_PLAYERS = 60;

const gameMatchShouldStop = (tick: number, lastTickWithPlayers: number, tickRate: number): boolean => {
    return (tick - lastTickWithPlayers) / tickRate >= GAME_MATCH_SECONDS_WITHOUT_PLAYERS;
};

const gameMatchValidateUsername = (username: string): string | void => {
    if (username.toUpperCase().indexOf('O') !== -1) {
        return 'Invalid username';
    }
};
