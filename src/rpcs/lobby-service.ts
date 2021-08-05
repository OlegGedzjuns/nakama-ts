function rpcLobbyInvite(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    const payloadObject = JSON.parse(payload);

    // TODO: eject validation to before hooks
    if (!payloadObject.usernames || payloadObject.usernames.length === 0) {
        return new NakamaError(ERROR_TYPES.WRONG_PARAMS, 'No usernames provided').toString();
    }

    if (!payloadObject.matchId) {
        return new NakamaError(ERROR_TYPES.WRONG_PARAMS, 'No matchId provided').toString();
    }

    const users: nkruntime.User[] = nk.usersGetUsername(payloadObject.usernames);

    let notifications: nkruntime.NotificationRequest[] = [];

    for (let user of users) {
        notifications.push({
            code: NOTIFICATION_TYPES.LOBBY_INVITE,
            content: { matchId: payloadObject.matchId },
            persistent: true,
            senderId: context.userId,
            subject: 'You are invited to lobby',
            userId: user.userId,
        });
    }

    if (notifications.length) {
        nk.notificationsSend(notifications);
    }

    return '';
}
