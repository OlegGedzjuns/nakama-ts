function rpcSaveLevel(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    const payloadObject = JSON.parse(payload);

    const levels: nkruntime.StorageWriteRequest[] = [
        {
            collection: 'levels',
            key: payloadObject.key,
            userId: SYSTEM_USER_ID,
            value: payloadObject.level,
            permissionRead: 2,
        },
    ];

    try {
        const response = nk.storageWrite(levels);
        return JSON.stringify({ key: response[0].key });
    } catch (err) {
        logger.error(err);
        return err;
    }
}

function rpcListLevels(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    const userId = null;
    const collection = 'levels';

    const response = nk.storageList(userId, collection);

    const levels = response.objects ?? [];

    return JSON.stringify(levels);
}