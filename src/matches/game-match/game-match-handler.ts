const GAME_MATCH_SECONDS_WITHOUT_PLAYERS = 60;

const gameMatchLoadLevel = (nk: nkruntime.Nakama, levelId: string): {} => {
    return nk.storageRead([
        {
            collection: 'levels',
            key: levelId,
            // https://github.com/heroiclabs/nakama/issues/657
            userId: '00000000-0000-0000-0000-000000000000',
        },
    ])[0]?.value;
};

const gameMatchShouldStop = (tick: number, lastTickWithPlayers: number, tickRate: number): boolean => {
    return (tick - lastTickWithPlayers) / tickRate >= GAME_MATCH_SECONDS_WITHOUT_PLAYERS;
};

const gameMatchValidateUsername = (username: string): string | void => {
    if (username.toUpperCase().indexOf('O') !== -1) {
        return 'Invalid username';
    }
};
