import { Portal, PortalColor } from "./portal"
import utils from "../node_modules/decentraland-ecs-utils/index"

const base = new Entity()
base.addComponent(new GLTFShape("models/baseDark.glb"))
base.addComponent(new Transform({ scale: new Vector3(2, 1, 2) }))
engine.addEntity(base)

const walls = new Entity()
walls.addComponent(new GLTFShape("models/walls.glb"))
walls.addComponent(new Transform())
engine.addEntity(walls)

const gun = new Entity()
gun.addComponent(new BoxShape())
gun.addComponent(
  new Transform({
    position: new Vector3(0.33, 0, 1),
    scale: new Vector3(0.5, 0.5, 1),
  })
)
engine.addEntity(gun)
gun.setParent(Attachable.PLAYER)

// Sounds
const teleportSound = new Entity()
teleportSound.addComponent(new AudioSource(new AudioClip("sounds/teleport.mp3")))
teleportSound.addComponent(new Transform())
teleportSound.getComponent(Transform).position = Camera.instance.position
engine.addEntity(teleportSound)

const portalSuccessSound = new Entity()
portalSuccessSound.addComponent(new AudioSource(new AudioClip("sounds/portalSuccess.mp3")))
portalSuccessSound.addComponent(new Transform())
portalSuccessSound.getComponent(Transform).position = Camera.instance.position
engine.addEntity(portalSuccessSound)

// Portals
const portalOrange = new Portal(new GLTFShape("models/portalOrange.glb"))
const portalBlue = new Portal(new GLTFShape("models/portalBlue.glb"))

let triggerBox = new utils.TriggerBoxShape(new Vector3(2, 2, 2), Vector3.Zero())

portalBlue.addComponent(
  new utils.TriggerComponent(
    triggerBox,
    null, null, null, null,
    () => {
      if (portalOrange.hasComponent(Transform)) {
        teleportSound.getComponent(AudioSource).playOnce()

        movePlayerTo(portalOrange.getComponent(Transform).position, portalOrange.cameraTarget)
        triggerBox.size.setAll(0)
        portalOrange.addComponent(new utils.Delay(1000, () => {triggerBox.size.setAll(2)}))
        portalBlue.addComponent(new utils.Delay(1000, () => {triggerBox.size.setAll(2)}))
      }
    }
  )
)
portalOrange.addComponent(
  new utils.TriggerComponent(
    triggerBox,
    null, null, null, null,
    () => {
      if (portalBlue.hasComponent(Transform)) {
        teleportSound.getComponent(AudioSource).playOnce()

        movePlayerTo(portalBlue.getComponent(Transform).position, portalBlue.cameraTarget)
        triggerBox.size.setAll(0)
        portalOrange.addComponent(new utils.Delay(1000, () => {triggerBox.size.setAll(2)}))
        portalBlue.addComponent(new utils.Delay(1000, () => {triggerBox.size.setAll(2)}))
      }
    }
  )
)

// Controls
const input = Input.instance
let activePortal = PortalColor.Blue

input.subscribe("BUTTON_DOWN", ActionButton.POINTER, true, (event) => {

  portalSuccessSound.getComponent(AudioSource).playOnce()

  if (activePortal == PortalColor.Blue) {
    // Create a new Transform component each time when using the lookAt
    portalBlue.addComponentOrReplace(new Transform())
    portalBlue.getComponent(Transform).lookAt(event.hit.normal)
    portalBlue.getComponent(Transform).position = event.hit.hitPoint
    portalBlue.cameraTarget = portalBlue.getComponent(Transform).position.add(event.hit.normal)
  } else {
    portalOrange.addComponentOrReplace(new Transform())
    portalOrange.getComponent(Transform).lookAt(event.hit.normal)
    portalOrange.getComponent(Transform).position = event.hit.hitPoint
    portalOrange.cameraTarget = portalOrange.getComponent(Transform).position.add(event.hit.normal)
  }
})


// NOTE: Will change this to the F key if we're adding an E key for picking up objects
input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, (): void => {
  log("E Key Pressed")
  activePortal == PortalColor.Blue ? (activePortal = PortalColor.Orange) : (activePortal = PortalColor.Blue)
})
