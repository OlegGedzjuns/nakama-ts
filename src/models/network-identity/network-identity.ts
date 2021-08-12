import { NetworkIdentityData } from './network-identity-data';

export class NetworkIdentity {
    id: number;
    syncInterval: number;

    data: NetworkIdentityData;

    constructor(id: number, syncInterval: number = 1, data: NetworkIdentityData = new NetworkIdentityData()) {
        this.id = id;
        this.syncInterval = syncInterval;

        this.data = data;
    }
}
