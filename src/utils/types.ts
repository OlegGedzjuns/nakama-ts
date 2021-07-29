class Player {
  position = new pc.Vec3();

  presence: nkruntime.Presence;

  constructor(presence: nkruntime.Presence, position: pc.Vec3 = pc.Vec3.ZERO) {
    this.position.copy(position);
    this.presence = presence;
  }
}
