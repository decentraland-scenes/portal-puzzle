import { Portal, PortalColor } from "./portal"
import { Card } from "./card"
import { Gun } from "./gun"
import { Sound } from "./sound"
import utils from "../node_modules/decentraland-ecs-utils/index"

const base = new Entity()
base.addComponent(new GLTFShape("models/baseLight.glb"))
engine.addEntity(base)

const walls = new Entity()
walls.addComponent(new GLTFShape("models/walls.glb"))
walls.addComponent(new Transform())
engine.addEntity(walls)

// Gun
const gun = new Gun(new GLTFShape("models/portalGun.glb"), new Transform({ position: new Vector3(8, 1.5, 4.5) }))

const gunBlueGlow = new Entity()
gunBlueGlow.addComponent(new GLTFShape("models/portalGunBlueGlow.glb"))
gunBlueGlow.addComponent(new Transform())
gunBlueGlow.setParent(gun)
engine.addEntity(gun)

const gunOrangeGlow = new Entity()
gunOrangeGlow.addComponent(new GLTFShape("models/portalGunOrangeGlow.glb"))
gunOrangeGlow.addComponent(new Transform())
gunOrangeGlow.getComponent(Transform).scale.setAll(0)
gunOrangeGlow.setParent(gun)

// Card
const card = new Card(new GLTFShape("models/card.glb"), new Transform({ position: new Vector3(8, 6.75, 13.5) }))

// Sounds
const teleportSound = new Sound(new AudioClip("sounds/teleport.mp3"))
const portalSuccessSound = new Sound(new AudioClip("sounds/portalSuccess.mp3"))
const portalFailSound = new Sound(new AudioClip("sounds/portalFail.mp3"))

// Portals
const portalOrange = new Portal(new GLTFShape("models/portalOrange.glb"))
const portalBlue = new Portal(new GLTFShape("models/portalBlue.glb"))

let triggerBox = new utils.TriggerBoxShape(new Vector3(2, 2, 2), Vector3.Zero())

portalBlue.addComponent(
  new utils.TriggerComponent(triggerBox, null, null, null, null, () => {
    if (portalOrange.hasComponent(Transform)) {
      teleportSound.getComponent(AudioSource).playOnce()

      movePlayerTo(portalOrange.getComponent(Transform).position, portalOrange.cameraTarget)
      triggerBox.size.setAll(0)
      portalOrange.addComponent(
        new utils.Delay(1000, () => {
          triggerBox.size.setAll(2)
        })
      )
      portalBlue.addComponent(
        new utils.Delay(1000, () => {
          triggerBox.size.setAll(2)
        })
      )
    }
  })
)
portalOrange.addComponent(
  new utils.TriggerComponent(triggerBox, null, null, null, null, () => {
    if (portalBlue.hasComponent(Transform)) {
      teleportSound.getComponent(AudioSource).playOnce()

      movePlayerTo(portalBlue.getComponent(Transform).position, portalBlue.cameraTarget)
      triggerBox.size.setAll(0)
      portalOrange.addComponent(
        new utils.Delay(1000, () => {
          triggerBox.size.setAll(2)
        })
      )
      portalBlue.addComponent(
        new utils.Delay(1000, () => {
          triggerBox.size.setAll(2)
        })
      )
    }
  })
)

// Controls
const input = Input.instance
let activePortal = PortalColor.Blue

input.subscribe("BUTTON_DOWN", ActionButton.POINTER, true, (event) => {
  if (event.hit.meshName.match("lightWall_collider")) {
    portalSuccessSound.getComponent(AudioSource).playOnce()

    if (activePortal == PortalColor.Blue) {
      // Create a new Transform component each time when using the lookAt
      portalBlue.addComponentOrReplace(new Transform())
      portalBlue.getComponent(Transform).lookAt(event.hit.normal)
      portalBlue.getComponent(Transform).position = event.hit.hitPoint
      portalBlue.cameraTarget = portalBlue.getComponent(Transform).position.add(event.hit.normal)
      portalBlue.playAnimation()
    } else {
      portalOrange.addComponentOrReplace(new Transform())
      portalOrange.getComponent(Transform).lookAt(event.hit.normal)
      portalOrange.getComponent(Transform).position = event.hit.hitPoint
      portalOrange.cameraTarget = portalOrange.getComponent(Transform).position.add(event.hit.normal)
      portalOrange.playAnimation()
    }
  } else {
    portalFailSound.getComponent(AudioSource).playOnce()
  }
})

// NOTE: Will change this to the F key if we're adding an E key for picking up objects
input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, (): void => {
  log("E Key Pressed")
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
