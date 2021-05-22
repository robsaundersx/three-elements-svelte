<script>
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  export let color = "white";
  export let selectedColor = "yellow";

  $: rotateSpeed = tweened(0, {
    duration: 1000,
    easing: cubicOut
  });

  const rotate = (dt, { object, requestFrame }) => {
    if ($rotateSpeed > 0) {
      object.rotation.z += $rotateSpeed * dt;
      requestFrame();
    }
  };

  const onEnter = ({ target }) => {
    const { object, game } = target;
    /* three-elements bug here! */
    target.parentElement.tick = rotate;
    object.material.color.set(selectedColor);
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

<!-- Costume -->
<three-group id="costume" position="0 1.3 0" rotation="85deg 0 0">
	<!-- Box -->
	<three-mesh id="box" position="0 0 0.875" receive-shadow cast-shadow onpointerenter={onEnter}
  onpointerleave={onLeave}>
		<three-box-geometry args="0.75 0.75 0.75"></three-box-geometry>
		<three-mesh-standard-material color={color}></three-mesh-standard-material>
	</three-mesh>
	<!-- Mesh -->
	<three-mesh id="mount" position="0 0 0.25" rotation="-90deg 0 0" visible="true" cast-shadow>
		<three-cylinder-geometry args="0.02 0.02 0.5 8 1"></three-cylinder-geometry>
		<three-mesh-standard-material color="#000"></three-mesh-standard-material>
	</three-mesh>
</three-group>