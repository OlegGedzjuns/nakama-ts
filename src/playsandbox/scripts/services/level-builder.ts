import * as pc from '../../../libs/playcanvas';

class LevelBuilder {
    public static build(scene, app: pc.Application) {
        const sceneRegistryItem = new pc.SceneRegistryItem(scene.name, scene.item_id);
        //@ts-ignore
        sceneRegistryItem.data = scene;
        //@ts-ignore
        sceneRegistryItem._loading = false;

        const sr = new pc.SceneRegistry(app);    
        sr.loadSceneData(sceneRegistryItem, () => {});
        sr.loadSceneHierarchy(sceneRegistryItem, () => {});
        sr.loadSceneSettings(sceneRegistryItem, () => {});
        
        const gameRoot = app.root.findByTag('game-root')[0];
        gameRoot.reparent(app.root);
    };

    addEntity(data, app: pc.Application, console: nkruntime.Logger) {
        const templateAsset = app.assets.get(data.templateId);
        
        console.info('Asset found: ' + !!templateAsset);
            
        const entity = templateAsset.resource.instantiate();
        
        // entity.script.networkIdentity.id = data.scripts.networkIdentity.id;
        // entity.script.networkIdentity.syncInterval = data.scripts.networkIdentity.syncInterval;
        // entity.script.networkIdentity.isOwner = data.scripts.networkIdentity.ownerId == CLIENT.session.user_id;
        // entity.script.networkIdentity.initialize();
        
        entity.rigidbody.teleport(0, 0, 1 * data.scripts.networkIdentity.id);
        
        const username = entity.findByTag('username')[0];
        
        if (username)
            username.element.text = data.username;
        
        const followCamera = app.root.findByTag('follow-camera')[0] as pc.Entity;
        
        if (followCamera && entity.script.networkIdentity.isOwner)
            //@ts-ignore
            followCamera.script.fallCamera.targetEntity = entity;
        
        entity.reparent(app.root);
    };
}
