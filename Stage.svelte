<script>
	import Beacon from "./Beacon.svelte";
	import Costume from "./Costume.svelte";

	export let color = "#444";
	export let selectedColor = "white";
	export let position = [0, 0, 0];
</script>

<three-group id="mml-stage" {position}>
	<three-mesh id="mml-floor" position="0 -0.01 0" receive-shadow>
		<three-box-geometry args="4 0.02 4"></three-box-geometry>
		<three-mesh-standard-material color={color} metalness="0.5" roughness="0.5"></three-mesh-standard-material>
	</three-mesh>
  <Costume color={color} selectedColor={selectedColor}/>
	<Beacon id="mml-beacon-1" position="2 2 2"/>
	<Beacon id="mml-beacon-2" position="-2 2 -2"/>
</three-group>