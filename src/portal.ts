// Config
export enum PortalColor {
  Blue = 0,
  Orange = 1
}

export class Portal extends Entity {
  public cameraTarget: Vector3 // Direction the player should be facing after teleporting

  constructor(model: GLTFShape) {
    super()
    engine.addEntity(this)
    this.addComponent(model)
    this.addComponent(new Animator())
    this.getComponent(Animator).addClip(
      new AnimationState('Expand', { looping: false })
    )
  }

  playAnimation() {
    this.getComponent(Animator).getClip('Expand').stop() // Bug workaround
    this.getComponent(Animator).getClip('Expand').play()
  }
}
