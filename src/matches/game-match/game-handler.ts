import { Vec3 } from '../../libs/playcanvas';

import { NakamaError } from '../../models/error';
import { NetworkIdentity } from '../../models/network-identity/network-identity';
import { Player } from '../../models/player';
import { ClientActionParams } from '../../models/client-action';

import { CLIENT_MESSAGES, SERVER_MESSAGES, SYSTEM_USER_ID } from '../../utils/constants';

export class GameHandler {
    public static readonly TICK_RATE = 60;

    private static readonly SECONDS_WITHOUT_PLAYERS = 60;
    private static readonly PLAYER_TEMPLATE_ID = 53910467;
    private static lastNetworkId = 0;

    public static initState(nk: nkruntime.Nakama, params: { [key: string]: any }) {
        const [level, networkIdentities] = this.initializeLevel(nk, params.levelId);
        const players: Player[] = [];
        const expectedPlayers: number = params.expectedPlayers;
        const playersInitialized: boolean = false;
        const lastActiveTick: number = 0;

        return { level, networkIdentities, players, expectedPlayers, playersInitialized, lastActiveTick };
    }

    public static validateJoinAttempt(state: nkruntime.MatchState, presensce: nkruntime.Presence): NakamaError | null {
        return null;
    }

    public static addPlayer(dispatcher: nkruntime.MatchDispatcher, state: nkruntime.MatchState, presence: nkruntime.Presence): nkruntime.MatchState {
        const player = new Player(presence);

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
            if (CLIENT_MESSAGES[k].code == message.opCode)
                return CLIENT_MESSAGES[k].action({ logger, nk, dispatcher, state, message });
        }

        logger.warn('Cannot find player message action with code: ', message.opCode);

        return state;
    }

    public static movePlayer(data: ClientActionParams): nkruntime.MatchState {
        const message = JSON.parse(data.message.data);

        const player: Player | null = data.state.players.find((p : Player) => p.presence.userId == data.message.sender.userId);

        if (!player)
            return data.state;

        const networkIdentity: NetworkIdentity | null = data.state.networkIdentities.find((i: NetworkIdentity) => i.id == player.networkId);

        if (!networkIdentity)
            return data.state;

        if (message.position) {
            networkIdentity.data.position.x = message.position.x;
            networkIdentity.data.position.y = message.position.y;
            networkIdentity.data.position.z = message.position.z;
        }

        if (message.direction) {
            networkIdentity.data.position.x += message.direction.x;
            networkIdentity.data.position.y += message.direction.y;
            networkIdentity.data.position.z += message.direction.z;
        }

        return data.state;
    }

    public static playerLevelInitialized(data: ClientActionParams): nkruntime.MatchState {
        for (let player of data.state.players as Player[]) {
            if (player.presence.userId === data.message.sender.userId) {
                player.levelCreated = true;
                break;
            }
        }

        return data.state;
    }

    public static initializePlayers(state: nkruntime.MatchState, dispatcher: nkruntime.MatchDispatcher): nkruntime.MatchState {
        let entitiesToCreate: { templateId: number; scripts: { [name: string]: any }; username: string; }[] = [];

        for (let player of state.players as Player[]) {
            const networkIdentity = new NetworkIdentity(this.lastNetworkId++, 1);
            networkIdentity.data.position = Vec3.ZERO.clone();

            player.networkId = networkIdentity.id;

            state.networkIdentities.push(networkIdentity);

            entitiesToCreate.push({
                templateId: this.PLAYER_TEMPLATE_ID,
                scripts: { networkIdentity: { syncInterval: networkIdentity.syncInterval, id: networkIdentity.id, ownerId: player.presence.userId } },
                username: player.presence.username,
            });
        }

        this.createEntities(dispatcher, entitiesToCreate);

        state.playersInitialized = true;

        return state;
    }

    public static createEntities(dispatcher: nkruntime.MatchDispatcher, entities: { templateId: number; scripts: { [name: string]: any }; username: string; }[]) {
        dispatcher.broadcastMessage(SERVER_MESSAGES.CREATE_ENTITIES, JSON.stringify(entities), null, null, true);
    }

    public static handleNetworkIdentitiesChanges(networkIdentities: NetworkIdentity[]): NetworkIdentity[] {
        return networkIdentities;
    }

    public static getNetworkIdentitiesToSync(tick: number, networkIdentities: NetworkIdentity[]): NetworkIdentity[] {
        let networkIdentitiesChanges: NetworkIdentity[] = [];

        for (let identity of networkIdentities) {
            if (tick % identity.syncInterval !== 0)
                continue;

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
