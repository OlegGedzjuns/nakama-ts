import { NetworkIdentityData } from "./network-identity-data";

export class NetworkIdentity {
    networkId: number;
    syncInterval: number;

    data: NetworkIdentityData;

    constructor(networkId: number, syncInterval: number = 1, data: NetworkIdentityData = new NetworkIdentityData()) {
        this.networkId = networkId;
        this.syncInterval = syncInterval;

        this.data = data;
    }
}
