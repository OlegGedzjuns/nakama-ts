export class Player {
    presence: nkruntime.Presence;
    networkId: number;
    levelCreated: boolean;
    isReady: boolean;

    constructor(presence: nkruntime.Presence, networkId: number = 0) {
        this.presence = presence;
        this.networkId = networkId;
    }
}
