import { Portal, PortalColor } from "./portal"
import { Card } from "./card"
import { Gun } from "./gun"
import { Sound } from "./sound"
import utils from "../node_modules/decentraland-ecs-utils/index"

// Base
const base = new Entity()
base.addComponent(new GLTFShape("models/baseLight.glb"))
engine.addEntity(base)

// Walls
const walls = new Entity()
walls.addComponent(new GLTFShape("models/walls.glb"))
walls.addComponent(new Transform())
engine.addEntity(walls)

// Gun
const gunBlueGlow = new Entity()
gunBlueGlow.addComponent(new Transform())
gunBlueGlow.addComponent(new GLTFShape("models/portalGunBlueGlow.glb"))
const gunOrangeGlow = new Entity()
gunOrangeGlow.addComponent(new Transform())
gunOrangeGlow.addComponent(new GLTFShape("models/portalGunOrangeGlow.glb"))
gunOrangeGlow.getComponent(Transform).scale.setAll(0) // Hide orange glow
const gun = new Gun(new GLTFShape("models/portalGun.glb"), new Transform({ position: new Vector3(8, 1.5, 4.5) }), gunBlueGlow, gunOrangeGlow)

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
      portalOrange.addComponent(new utils.Delay(1500, () => { triggerBox.size.setAll(2) })) 
      portalBlue.addComponent(new utils.Delay(1500, () => { triggerBox.size.setAll(2) }))
    }
  })
)
portalOrange.addComponent(
  new utils.TriggerComponent(triggerBox, null, null, null, null, () => {
    if (portalBlue.hasComponent(Transform)) {
      teleportSound.getComponent(AudioSource).playOnce()
      movePlayerTo(portalBlue.getComponent(Transform).position, portalBlue.cameraTarget)
      triggerBox.size.setAll(0)
      portalOrange.addComponent(new utils.Delay(1500, () => { triggerBox.size.setAll(2) }))
      portalBlue.addComponent(new utils.Delay(1500, () => { triggerBox.size.setAll(2) }))
    }
  })
)

// Controls
const input = Input.instance
let activePortal = PortalColor.Blue

input.subscribe("BUTTON_DOWN", ActionButton.POINTER, true, (event) => {
  if (gun.hasGun) {
    if (event.hit.meshName.match("lightWall_collider")) {
      portalSuccessSound.getComponent(AudioSource).playOnce()

      if (activePortal == PortalColor.Blue) {
        // Create a new Transform component each time when using the lookAt
        portalBlue.addComponentOrReplace(new Transform())
        portalBlue.getComponent(Transform).lookAt(event.hit.normal)
        portalBlue.getComponent(Transform).position = event.hit.hitPoint
        portalBlue.cameraTarget = portalBlue.getComponent(Transform).position.add(event.hit.normal)
        if (portalBlue.getComponent(Transform).position.y <= 1.2) portalBlue.getComponent(Transform).position.y = 1.2
        portalBlue.playAnimation()
      } else {
        portalOrange.addComponentOrReplace(new Transform())
        portalOrange.getComponent(Transform).lookAt(event.hit.normal)
        portalOrange.getComponent(Transform).position = event.hit.hitPoint
        portalOrange.cameraTarget = portalOrange.getComponent(Transform).position.add(event.hit.normal)
        if (portalOrange.getComponent(Transform).position.y <= 1.2) portalOrange.getComponent(Transform).position.y = 1.2
        portalOrange.playAnimation()
      }
    } else {
      portalFailSound.getComponent(AudioSource).playOnce()
    }
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
