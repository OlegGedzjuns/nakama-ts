import * as pc from '../../../libs/playcanvas';

import { GameHandler } from '../../../matches/game-match/game-handler';

export const create = function() {
    var Test = pc.createScript('test', GameHandler.app);

    Test.prototype.update = function(dt) {
        this.entity.fire('test', `test ${dt}`);
    } 
}
