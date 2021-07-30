class Player {
    x: number;
    y: number;
    z: number;

    presence: nkruntime.Presence;

    constructor(presence: nkruntime.Presence, x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;

        this.presence = presence;
    }
}
