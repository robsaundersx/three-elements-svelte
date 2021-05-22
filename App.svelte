<script>
  import { onMount } from "svelte";
  import Lights from "./Lights";
  import Thingy from "./Thingy";
  import Stage from "./Stage";
  import Costume from "./Costume";

  let game;
  let scene;
  let camera;

  onMount(() => {
    // Assign camera to scene once the scene has been mounted
    // NOTE: This is necessary because camera="#camera" in <three-scene> doesn't work in this context
    scene.camera = camera.object;
  });
</script>

<style>
  :global(body, html) {
    width: 100vw;
    height: 100vh;
    margin: 0;
    overflow: hidden;
  }
</style>

<three-game>
  <three-scene bind:this={scene} background-color="#222"> <!-- camera="#camera" -->
    <three-perspective-camera bind:this={camera} id="camera" args="45 2 0.1 1000" position="-1 2 6"></three-perspective-camera>

    <Lights />
    <!-- <Thingy color="red" scale=2 position={[-1, 1, 0]} />
    <Thingy color="yellow" scale=20 position={[10, -10, -90]} /> -->

    <Stage position={[-2.1, 0,  2.1]} color="#dad" selectedColor="magenta"/>
    <Stage position={[ 2.1, 0,  2.1]} color="#ada" selectedColor="green"/>
    <Stage position={[-2.1, 0, -2.1]} color="#dda" selectedColor="yellow"/>
    <Stage position={[ 2.1, 0, -2.1]} color="#add" selectedColor="cyan"/>

    <three-orbit-controls />
  </three-scene>
</three-game>
