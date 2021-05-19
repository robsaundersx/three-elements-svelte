<script>
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  export let color = "hotpink";
  export let position = [0, 0, 0];
  export let scale = 2;

  $: rotateSpeed = tweened(0, {
    duration: scale * 1000,
    easing: cubicOut
  });

  const rotate = (dt, { object, requestFrame }) => {
    if ($rotateSpeed > 0) {
      object.rotation.x = object.rotation.y += $rotateSpeed * dt;
      requestFrame();
    }
  };

  const onEnter = ({ target }) => {
    const { object, game } = target;
    /* three-elements bug here! */
    target.tick = rotate;
    object.material.color.set("white");
    rotateSpeed.set(3);
    game.requestFrame();
  };

  const onLeave = ({ target }) => {
    const { object, game } = target;
    object.material.color.set(color);
    rotateSpeed.set(0);
    game.requestFrame();
  };
</script>

<three-mesh
  scale={scale} {position}
  onpointerenter={onEnter}
  onpointerleave={onLeave}>
	<three-dodecahedron-buffer-geometry />
	<three-mesh-standard-material color={color} />
</three-mesh>
