// Config
export enum PortalColor {
  Blue = 0,
  Orange = 1,
}

export class Portal extends Entity {

  public cameraTarget: Vector3 // Direction the player should be facing after teleporting

  constructor(model: GLTFShape) {
    super()
    engine.addEntity(this)
    this.addComponent(model)
    this.addComponent(new Transform({ scale: new Vector3(0, 0, 0)}))
  }
}
