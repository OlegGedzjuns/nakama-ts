import * as pc from '../../../libs/playcanvas';

export const create = function(app, logger) {
    var Test = pc.createScript('test', app);

    Test.prototype.initialize= function() {
        logger.info('CREATED');
        
        this.entity.on('destroy', () => {
            logger.info('DESTROYED');
        });
    }

    Test.prototype.update = function(dt) {
        this.entity.fire('test', `test ${dt}`);
    } 
}
