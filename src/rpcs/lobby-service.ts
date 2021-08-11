import { NakamaError } from '../models/error';

import { ERROR_TYPES, NOTIFICATION_TYPES } from '../utils/constants';

export function rpcLobbyInvite(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    const payloadObject = JSON.parse(payload);

    // TODO: eject validation to before hooks
    if (!payloadObject.username) throw new NakamaError(ERROR_TYPES.WRONG_PARAMS, 'No username provided').toString();

    if (!payloadObject.lobbyId) throw new NakamaError(ERROR_TYPES.WRONG_PARAMS, 'No lobbyId provided').toString();

    const users: nkruntime.User[] = nk.usersGetUsername([payloadObject.username]);

    if (!users[0]) throw new NakamaError(ERROR_TYPES.WRONG_PARAMS, 'User not found').toString();

    nk.notificationSend(
        users[0].userId,
        'You are invited to lobby',
        { lobbyId: payloadObject.lobbyId },
        NOTIFICATION_TYPES.LOBBY_INVITE,
        context.userId,
        true
    );

    return '';
}
