export class Sound extends Entity {
  constructor(audio: AudioClip) {
    super()
    engine.addEntity(this)
    this.addComponent(new AudioSource(audio))
    this.addComponent(new Transform())
    this.setParent(Attachable.FIRST_PERSON_CAMERA) // Play the sound wherever the player is standing
  }
}
