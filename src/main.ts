import HTMLCanvasElement from 'webgl-mock-threejs/src/HTMLCanvasElement';

import { lobbyInit, lobbyJoin, lobbyJoinAttempt, lobbyLeave, lobbyLoop, lobbyTerminate } from './matches/lobby-match/lobby';
import { gameInit, gameJoin, gameJoinAttempt, gameLeave, gameLoop, gameTerminate } from './matches/game-match/game';

import { rpcCreateMatch } from './rpcs/match-service';
import { rpcLobbyInvite } from './rpcs/lobby-service';
import { rpcSaveLevel, rpcGetLevels } from './rpcs/storage-service';
import { Application, Entity } from './libs/playcanvas';

let InitModule: nkruntime.InitModule = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    initializer: nkruntime.Initializer
) {
    const canvas = new HTMLCanvasElement(100, 100);

    const app = new Application(canvas, {});

    const box = new Entity('cube');
    box.addComponent('model', {
        type: 'box'
    });
    // app.root.addChild(box);

    app.on('update', dt => logger.info('DT: ' + dt));

    app.start();

    initializer.registerMatch('lobby', {
        matchInit: lobbyInit,
        matchJoinAttempt: lobbyJoinAttempt,
        matchJoin: lobbyJoin,
        matchLeave: lobbyLeave,
        matchLoop: lobbyLoop,
        matchTerminate: lobbyTerminate,
    });

    initializer.registerMatch('game', {
        matchInit: gameInit,
        matchJoinAttempt: gameJoinAttempt,
        matchJoin: gameJoin,
        matchLeave: gameLeave,
        matchLoop: gameLoop,
        matchTerminate: gameTerminate,
    });

    initializer.registerRpc('createMatch', rpcCreateMatch);

    initializer.registerRpc('lobbyInvite', rpcLobbyInvite);

    initializer.registerRpc('saveLevel', rpcSaveLevel);
    initializer.registerRpc('getLevels', rpcGetLevels);
};

// Reference InitModule to avoid it getting removed on build
!InitModule && InitModule.bind(null);
