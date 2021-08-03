class NetworkIdentity {
    data: NetworkIdentityData;

    syncInterval: number;

    constructor(syncInterval:number = 1, data: NetworkIdentityData = new NetworkIdentityData()) {
        this.syncInterval = syncInterval;
        
        this.data = data;
    }
}


