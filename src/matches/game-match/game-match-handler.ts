class GameMatchHandler {
    static readonly SECONDS_WITHOUT_PLAYERS = 60;

    static loadLevel(nk: nkruntime.Nakama, levelId: string): {} {
        return nk.storageRead([{ collection: 'levels', key: levelId, userId: SYSTEM_USER_ID }])[0]?.value;
    }

    static getNetworkIdentities(level: { [key: string]: any }): { [guid: string]: NetworkIdentity } {
        let networkIdentities: { [guid: string]: NetworkIdentity } = {};

        for (let guid in level.entities) {
            if (level.entities[guid].components.script?.order.includes('networkIdentity')) {
                const script = level.entities[guid].components.script.scripts.networkIdentity;
                networkIdentities[guid] = new NetworkIdentity(script.attributes.syncInterval);
            }
        }

        return networkIdentities;
    }

    static shouldStop(tick: number, lastTickWithPlayers: number, tickRate: number): boolean {
        return (tick - lastTickWithPlayers) / tickRate >= this.SECONDS_WITHOUT_PLAYERS;
    }

    static validateUsername(username: string): string | void {
        if (username.toUpperCase().indexOf('O') !== -1) {
            return 'Invalid username';
        }
    }

    static handleNetworkIdentitiesChanges(networkIdentities: { [key: string]: NetworkIdentity }) {
        for (let guid in networkIdentities) {
            networkIdentities[guid].data.color = Color.random();
        }

        return networkIdentities;
    }

    static getNetworkIdentitiesToSync(tick: number, networkIdentities: { [key: string]: NetworkIdentity }): { [key: string]: NetworkIdentity } {
        let networkIdentitiesChanges: { [key: string]: any } = {};

        for (let guid in networkIdentities) {
            if (tick % networkIdentities[guid].syncInterval !== 0) {
                continue;
            }

            networkIdentitiesChanges[guid] = {
                data: networkIdentities[guid].data,
            };
        }

        return networkIdentitiesChanges;
    }
}
