import * as pc from '../../../libs/playcanvas';

export const create = function(app, console) {
    var Test = pc.createScript('test', app);

    Test.prototype.initialize = function() {
        console.info('CREATED');
        
        this.entity.on('destroy', () => {
            console.info('DESTROYED');
        });
    }

    Test.prototype.update = function(dt) {
        this.entity.fire('example', `example ${dt}`);
    }
}
