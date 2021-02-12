import { Portal, PortalColor } from './portal'
import { Card } from './card'
import { Gun } from './gun'
import { Sound } from './sound'
import * as utils from '@dcl/ecs-scene-utils'
import { movePlayerTo } from '@decentraland/RestrictedActions'

// Base
const base = new Entity()
base.addComponent(new GLTFShape('models/baseLight.glb'))
engine.addEntity(base)

// Walls
const walls = new Entity()
walls.addComponent(new GLTFShape('models/walls.glb'))
walls.addComponent(new Transform())
engine.addEntity(walls)

// Gun
const gunBlueGlow = new Entity()
gunBlueGlow.addComponent(new Transform())
gunBlueGlow.addComponent(new GLTFShape('models/portalGunBlueGlow.glb'))
const gunOrangeGlow = new Entity()
gunOrangeGlow.addComponent(new Transform())
gunOrangeGlow.addComponent(new GLTFShape('models/portalGunOrangeGlow.glb'))
gunOrangeGlow.getComponent(Transform).scale.setAll(0) // Hide orange glow
const gun = new Gun(
  new GLTFShape('models/portalGun.glb'),
  new Transform({ position: new Vector3(8, 1.5, 4.5) }),
  gunBlueGlow,
  gunOrangeGlow
)

// Card
const card = new Card(
  new GLTFShape('models/card.glb'),
  new Transform({ position: new Vector3(8, 6.75, 13.5) })
)

// Sounds
const teleportSound = new Sound(new AudioClip('sounds/teleport.mp3'))
const portalSuccessSound = new Sound(new AudioClip('sounds/portalSuccess.mp3'))
const portalFailSound = new Sound(new AudioClip('sounds/portalFail.mp3'))

// Portals
const portalOrange = new Portal(new GLTFShape('models/portalOrange.glb'))
const portalBlue = new Portal(new GLTFShape('models/portalBlue.glb'))
const DELAY_TIME = 1500 // In milliseconds
const RESET_SIZE = 2 // In meters

let triggerBox = new utils.TriggerBoxShape(
  new Vector3(RESET_SIZE, RESET_SIZE, RESET_SIZE),
  Vector3.Zero()
)

portalBlue.addComponent(
  new utils.TriggerComponent(triggerBox, {
    onCameraEnter: () => {
      if (portalOrange.hasComponent(Transform)) {
        teleportSound.getComponent(AudioSource).playOnce()
        movePlayerTo(
          portalOrange.getComponent(Transform).position,
          portalOrange.cameraTarget
        )
        triggerBox.size.setAll(0) // Resize the trigger so that the player doesn't port in and out constantly
        portalOrange.addComponent(
          new utils.Delay(DELAY_TIME, () => {
            triggerBox.size.setAll(RESET_SIZE)
          })
        ) // Reset the trigger after 1.5 seconds
        portalBlue.addComponent(
          new utils.Delay(DELAY_TIME, () => {
            triggerBox.size.setAll(RESET_SIZE)
          })
        )
      }
    },
  })
)
portalOrange.addComponent(
  new utils.TriggerComponent(triggerBox, {
    onCameraEnter: () => {
      if (portalBlue.hasComponent(Transform)) {
        teleportSound.getComponent(AudioSource).playOnce()
        movePlayerTo(
          portalBlue.getComponent(Transform).position,
          portalBlue.cameraTarget
        )
        triggerBox.size.setAll(0)
        portalOrange.addComponent(
          new utils.Delay(DELAY_TIME, () => {
            triggerBox.size.setAll(RESET_SIZE)
          })
        )
        portalBlue.addComponent(
          new utils.Delay(DELAY_TIME, () => {
            triggerBox.size.setAll(RESET_SIZE)
          })
        )
      }
    },
  })
)

// Controls
const input = Input.instance
let activePortal = PortalColor.Blue
const HEIGHT_ABOVE_GROUND = 1.2 // In meters

input.subscribe('BUTTON_DOWN', ActionButton.POINTER, true, (event) => {
  if (gun.hasGun) {
    if (event.hit.meshName.match('lightWall_collider')) {
      // Only allow portals to appear on light walls
      portalSuccessSound.getComponent(AudioSource).playOnce()

      if (activePortal == PortalColor.Blue) {
        portalBlue.addComponentOrReplace(new Transform()) // Reset the Transform component
        let transform = portalBlue.getComponent(Transform)
        transform.lookAt(event.hit.normal)
        transform.position = event.hit.hitPoint
        portalBlue.cameraTarget = transform.position.add(event.hit.normal)
        if (transform.position.y <= HEIGHT_ABOVE_GROUND)
          transform.position.y = HEIGHT_ABOVE_GROUND // Make sure the portal is above ground height
        portalBlue.playAnimation()
      } else {
        portalOrange.addComponentOrReplace(new Transform())
        let transform = portalOrange.getComponent(Transform)
        transform.lookAt(event.hit.normal)
        transform.position = event.hit.hitPoint
        portalOrange.cameraTarget = transform.position.add(event.hit.normal)
        if (transform.position.y <= HEIGHT_ABOVE_GROUND)
          transform.position.y = HEIGHT_ABOVE_GROUND
        portalOrange.playAnimation()
      }
    } else {
      portalFailSound.getComponent(AudioSource).playOnce()
    }
  }
})

// Swap between portal colors when pressing the E key
input.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, (): void => {
  if (activePortal == PortalColor.Blue) {
    activePortal = PortalColor.Orange
    gunBlueGlow.getComponent(Transform).scale.setAll(0)
    gunOrangeGlow.getComponent(Transform).scale.setAll(1)
  } else {
    activePortal = PortalColor.Blue
    gunBlueGlow.getComponent(Transform).scale.setAll(1)
    gunOrangeGlow.getComponent(Transform).scale.setAll(0)
  }
})
