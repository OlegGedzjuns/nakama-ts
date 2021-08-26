import HTMLCanvasElement from 'webgl-mock-threejs/src/HTMLCanvasElement';

import * as pc from '../../libs/playcanvas';

import { create as createExample } from '../../playsandbox/scripts/components/example';

export class AppHandler {
    private static initializerApp: pc.Application | null = null;

    public static create(logger: nkruntime.Logger): pc.Application {
        this.initScripts(logger);

        const app = new pc.Application(new HTMLCanvasElement(), {});

        app.scripts = this.initializerApp.scripts;

        return app;
    }

    private static initScripts(logger: nkruntime.Logger) {
        if (this.initializerApp)
            return;

        this.initializerApp = new pc.Application(new HTMLCanvasElement(), {});
        
        createExample(this.initializerApp, logger);
    }
}
