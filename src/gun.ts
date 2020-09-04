import { Sound } from "./sound"
import utils from "../node_modules/decentraland-ecs-utils/index"
import { TriggerBoxShape } from "../node_modules/decentraland-ecs-utils/triggers/triggerSystem"

const gunPickupSound = new Sound(new AudioClip("sounds/gunPickup.mp3"))

export class Gun extends Entity {

  hasGun: boolean = false

  constructor(model: GLTFShape, transform: Transform, blueGlow: Entity, orangeGlow: Entity) {
    super()
    engine.addEntity(this)
    this.addComponent(model)
    this.addComponent(transform)
    this.addComponent(new utils.KeepRotatingComponent(Quaternion.Euler(0, 180, 0)))

    blueGlow.setParent(this)
    orangeGlow.setParent(this)

    // Create trigger for card
    this.addComponent(
      new utils.TriggerComponent(
        new TriggerBoxShape(new Vector3(2, 2, 2), Vector3.Zero()),
        null, null, null, null, // Default trigger params
        () => { // Camera enter
          this.hasGun = true
          this.setParent(Attachable.PLAYER)
          this.getComponent(Transform).position = new Vector3(0.33, 0.33, 1)
          this.getComponent(Transform).rotation.setEuler(0, 0, 0)
          this.getComponent(utils.KeepRotatingComponent).stop()
          gunPickupSound.getComponent(AudioSource).playOnce()
        }
      )
    )
  }
}