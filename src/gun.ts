import { Sound } from './sound'
import * as utils from '@dcl/ecs-scene-utils'

const gunPickupSound = new Sound(new AudioClip('sounds/gunPickup.mp3'))

export class Gun extends Entity {
  hasGun: boolean = false

  constructor(
    model: GLTFShape,
    transform: Transform,
    blueGlow: Entity,
    orangeGlow: Entity
  ) {
    super()
    engine.addEntity(this)
    this.addComponent(model)
    this.addComponent(transform)
    this.addComponent(
      new utils.KeepRotatingComponent(Quaternion.Euler(0, 180, 0))
    )

    blueGlow.setParent(this)
    orangeGlow.setParent(this)

    // Create trigger for card
    this.addComponent(
      new utils.TriggerComponent(
        new utils.TriggerBoxShape(new Vector3(2, 2, 2)),

        {
          onCameraEnter: () => {
            this.hasGun = true
            this.setParent(Attachable.FIRST_PERSON_CAMERA)
            this.getComponent(Transform).position = new Vector3(
              0.45,
              -0.425,
              0.9
            )
            this.getComponent(Transform).rotation.setEuler(0, 0, 0)
            this.getComponent(utils.KeepRotatingComponent).stop()
            gunPickupSound.getComponent(AudioSource).playOnce()
          }
        }
      )
    )
  }
}
