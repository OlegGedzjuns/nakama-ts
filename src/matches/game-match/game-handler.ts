import { Color } from '../../models/color';
import { NakamaError } from '../../models/error';
import { NetworkIdentity } from '../../models/network-identity/network-identity';
import { Player } from '../../models/player';
import { ClientActionParams } from '../../models/client-action';

import { CLIENT_MESSAGES, ERROR_TYPES, SERVER_MESSAGES, SYSTEM_USER_ID } from '../../utils/constants';

export class GameHandler {
    public static readonly TICK_RATE = 10;

    private static readonly SECONDS_WITHOUT_PLAYERS = 60;
    private static lastNetworkId = 0;

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

    public static addPlayer(dispatcher: nkruntime.MatchDispatcher, state: nkruntime.MatchState, presence: nkruntime.Presence): nkruntime.MatchState {
        const player = new Player(presence, 0);

        state.players.push(player);

        dispatcher.broadcastMessage(SERVER_MESSAGES.PLAYER_JOINED, JSON.stringify(player.presence), null, null, true);

        return state;
    }

    public static shouldStop(tick: number, lastTickWithPlayers: number, tickRate: number): boolean {
        return (tick - lastTickWithPlayers) / tickRate >= this.SECONDS_WITHOUT_PLAYERS;
    }

    public static handlePlayerMessage(
        logger: nkruntime.Logger,
        nk: nkruntime.Nakama,
        dispatcher: nkruntime.MatchDispatcher,
        state: nkruntime.MatchState,
        message: nkruntime.MatchMessage
    ): nkruntime.MatchState {
        for (let k of Object.keys(CLIENT_MESSAGES)) {
            if (CLIENT_MESSAGES[k].code == message.opCode) return CLIENT_MESSAGES[k].action({ logger, nk, dispatcher, state, message });
        }

        logger.warn('Cannot find player message action with code: ', message.opCode);

        return state;
    }

    public static movePlayer(data: ClientActionParams): nkruntime.MatchState {
        const message = JSON.parse(data.message.data);

        const player: Player | null = data.state.players.find(p => p.presence.userId == data.message.sender.userId);

        if (!player)
            return data.state;

        const networkIdentity: NetworkIdentity | null = data.state.networkIdentities.find(i => i.id == player.networkId);

        if (!networkIdentity)
            return data.state;

        networkIdentity.data.position.x += message.direction.x;
        networkIdentity.data.position.y += message.direction.y;
        networkIdentity.data.position.z += message.direction.z;

        return data.state;
    }

    // public static createEntitiy() {

    // }

    public static handleNetworkIdentitiesChanges(networkIdentities: NetworkIdentity[]): NetworkIdentity[] {
        for (let identity of networkIdentities) {
            identity.data.color = Color.random();
        }

        return networkIdentities;
    }

    public static getNetworkIdentitiesToSync(tick: number, networkIdentities: NetworkIdentity[]): NetworkIdentity[] {
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
                level.entities[guid].components.script.scripts.networkIdentity.attributes.networkId = this.lastNetworkId++;
                const attributes = level.entities[guid].components.script.scripts.networkIdentity.attributes;
                networkIdentities.push(new NetworkIdentity(attributes.id, attributes.syncInterval));
            }
        }

        return [level, networkIdentities];
    }
}
