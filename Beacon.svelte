<script>
  export let id = "beacon";
  export let position = [0, 0, 0];
</script>

<three-mesh id={id} {position}>
	<three-box-geometry args="0.15 0.15 0.15"></three-box-geometry>
	<three-mesh-standard-material color="#444" {position}></three-mesh-standard-material>
</three-mesh>