import { Color } from '../../models/color';
import { NakamaError } from '../../models/error';
import { NetworkIdentity } from '../../models/network-identity/network-identity';
import { Player } from '../../models/player';

import { ERROR_TYPES, SYSTEM_USER_ID } from '../../utils/constants';

export class GameHandler {
    static readonly SECONDS_WITHOUT_PLAYERS = 60;
    static readonly TICK_RATE = 10;

    public static initState(nk: nkruntime.Nakama, params: { [key: string]: any }) {
        const [level, networkIdentities] = this.initializeLevel(nk, params.levelId);
        const players: Player[] = [];
        const lastActiveTick: number = 0;

        return { level, networkIdentities, players, lastActiveTick };
    }

    public static validateJoinAttempt(state: nkruntime.MatchState, presensce: nkruntime.Presence): NakamaError | null {
        if (presensce.username.toUpperCase().indexOf('O') !== -1) return new NakamaError(ERROR_TYPES.INVALID_USERNAME, 'Invalid username');

        return null;
    }

    public static shouldStop(tick: number, lastTickWithPlayers: number, tickRate: number): boolean {
        return (tick - lastTickWithPlayers) / tickRate >= this.SECONDS_WITHOUT_PLAYERS;
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
            if (tick % identity.syncInterval !== 0) continue;

            networkIdentitiesChanges.push(identity);
        }

        return networkIdentitiesChanges;
    }

    private static initializeLevel(nk: nkruntime.Nakama, levelId: string): [{}, NetworkIdentity[]] {
        let rawLevel = this.loadLevel(nk, levelId);
        return this.initializeNetworkIdentities(rawLevel);
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
