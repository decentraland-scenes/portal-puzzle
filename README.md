# Portal Puzzle

## Objective
The player needs to get to the access key which is tucked away inside a cove and to get there you need to make use of a moving platform. However the only way to reach the platform, is to teleport to an area just above the moving platform in order to land on top of it. This is a simplified version of one of the levels in the original Portal game.

## Visual
* This only needs to be a small 1x1 or 2x2 scene.
* Two crescent shaped icons forming the crosshair to indicate which color portal is activated. Perhaps include the effect on the gun itself.
* Gun bob - so when the player walks, the gun moves up and down. This could be done with a sin wave or with animation
* Portal effect so a burst of particles appear when you teleport

## Logic
* Portals can only appear on light walls - so if you fire at a dark wall, nothing will appear. Will test for collider names e.g. "lightWall_collider" vs "darkWall_collider" for this logic.
* Portals shouldn't overlap each other so an easy solution is to make sure that the distance between the portals is far enough. However this doesn't take into account of corners. If the portals are on a different plane then they can get closer to each other.
* Portals should not be below a certain height i.e. shouldn't be intersecting the ground so if it's going below the ground then it automatically should readjust to be flush with the ground 
* Similar to the above, Portals in that are fire near a crevice / corner should appear with the edge of the portal flush with the corner
* If we going with the automatic platform then can use this: https://github.com/decentraland-scenes/moving-platforms/blob/master/src/movingPlatform.ts
* If we go with an oblong shaped portal then it should be rotated to the angle the direction the user fire the portal when shooting at the ceiling or ground
* If we're including the carrying of objects then rather than coding the logic to avoid intersection, we should out colliders to have thicker walls and then switch back when the player drops the object. Note: we can use physics for this but isn't necessary.

## Nice to haves
Probably won't be able to include these in the given time but would be nice to show off carrying an object through a portal.
* A cube with physics to weigh down buttons, which then activates the platform
* If we're including picking up cubes then the E key should be used for the interaction, which means the F key now becomes the key for switching between portal colors
