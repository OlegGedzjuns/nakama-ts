class GameMatchHandler {
    static readonly SECONDS_WITHOUT_PLAYERS = 60;

    public static initializeLevel(nk: nkruntime.Nakama, levelId: string): [{}, NetworkIdentity[]] {
        let rawLevel = this.loadLevel(nk, levelId);
        return this.initializeNetworkIdentities(rawLevel);
    }

    static validateUsername(username: string): string | void {
        if (username.toUpperCase().indexOf('O') !== -1) {
            return 'Invalid username';
        }
    }

    static handleNetworkIdentitiesChanges(networkIdentities: NetworkIdentity[]): NetworkIdentity[] {
        for (let identity of networkIdentities) {
            identity.data.color = Color.random();
        }

        return networkIdentities;
    }

    static getNetworkIdentitiesToSync(tick: number, networkIdentities: NetworkIdentity[]): NetworkIdentity[] {
        let networkIdentitiesChanges: NetworkIdentity[] = [];

        for (let identity of networkIdentities) {
            if (tick % identity.syncInterval !== 0) {
                continue;
            }

            networkIdentitiesChanges.push(identity);
        }

        return networkIdentitiesChanges;
    }

    static shouldStop(tick: number, lastTickWithPlayers: number, tickRate: number): boolean {
        return (tick - lastTickWithPlayers) / tickRate >= this.SECONDS_WITHOUT_PLAYERS;
    }

    private static loadLevel(nk: nkruntime.Nakama, levelId: string): {} {
        return nk.storageRead([{ collection: 'levels', key: levelId, userId: SYSTEM_USER_ID }])[0]?.value;
    }

    private static initializeNetworkIdentities(level: { [key: string]: any }): [{}, NetworkIdentity[]] {
        let networkIdentities: NetworkIdentity[] = [];

        for (let guid in level.entities) {
            if (level.entities[guid].components.script?.order.includes('networkIdentity')) {
                level.entities[guid].components.script.scripts.networkIdentity.attributes.networkId = networkIdentities.length;
                const attribures = level.entities[guid].components.script.scripts.networkIdentity.attributes;
                networkIdentities.push(new NetworkIdentity(attribures.networkId, attribures.syncInterval));
            }
        }

        return [level, networkIdentities];
    }
}
