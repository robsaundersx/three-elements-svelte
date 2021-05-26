<script>
  import { onMount } from "svelte";
  import { Box3, Sphere } from "three";
  import { recording } from "./js/stores.js";
  import Lights from "./Lights";
  import Thingy from "./Thingy";
  import Stage from "./Stage";
  import Costume from "./Costume";

  let game;
  let scene;
  let perspectiveCamera;
  let orthographicCamera;
  let controls;

  let cameraId = "perspective";

  let nStages = 4;

  let stage1;
  let stage2;
  let stage3;
  let stage4;
  let recording1;
  let recording1Loaded;

  let loaded;
  onMount(async () => {
    loaded = true;
    scene.camera = perspectiveCamera.object;
    loadRecording("data/mml_micro_1.1_1.log");
  });

  // onMount(() => {
  //   // Assign camera to scene once the scene has been mounted
  //   // NOTE: This is necessary because camera="#camera" in <three-scene> doesn't work in this context
  //   scene.camera = camera.object;

  //   recording = new Recording();
  //   recording.load("data/mml_micro_1.1_1.log", recordingLoaded);
  // });

  function zoomCameraToSelection(camera, controls, selection) {
    const box = new Box3();
    for (const object of selection) {
      box.expandByObject(object);
    }
    const sphere = box.getBoundingSphere(new Sphere());
    let distance = 1;
    if (camera.isPerspectiveCamera) {
      // Perspective camera
      const fitHeightDistance =
        sphere.radius / (2 * Math.atan((Math.PI * camera.fov) / 360));
      const fitWidthDistance = fitHeightDistance / camera.aspect;
      distance = 2 * Math.max(fitHeightDistance, fitWidthDistance);
      controls.maxDistance = distance * 10;
      camera.near = distance / 100;
      camera.far = distance * 100;
    } else {
      camera.zoom = 1 / sphere.radius;
    }

    const direction = controls.target
      .clone()
      .sub(camera.position)
      .normalize()
      .multiplyScalar(distance);

    controls.target.copy(sphere.center);
    camera.position.copy(controls.target).sub(direction);
    camera.updateProjectionMatrix();
    controls.update();
    game.requestFrame();
  }

  function zoomExtent() {
    zoomCameraToSelection(scene.camera, controls.object, scene.object.children);
  }

  function toggleCamera() {
    orthographicCamera.object.position.copy(scene.camera.position);
    perspectiveCamera.object.position.copy(scene.camera.position);
    // cameraId = cameraId == "perspective" ? "orthographic" : "perspective";
    scene.camera =
      scene.camera == perspectiveCamera ? orthographicCamera : perspectiveCamera;
    orthographicCamera.object.updateProjectionMatrix();
    perspectiveCamera.object.updateProjectionMatrix();
    controls.object.update();
    game.requestFrame();
  }

  function loadRecording(filename) {
    recording1 = recording(filename, recordingLoaded);
  }

  function recordingLoaded(filename) {
    recording1Loaded = true;
    console.log("Loaded: " + filename);
  }
</script>

<style>
  :global(body, html) {
    width: 100vw;
    height: 100vh;
    margin: 0;
    overflow: hidden;
  }
  .viewport {
    height: 100vh;
  }
  .menu {
    color: gray;
    display: flex;
    position: fixed;
    right: 0;
    bottom: 0;
  }
  .info {
    color: gray;
    display: flex;
    position: fixed;
    left: 0;
    top: 0;
  }
</style>

<div class="viewport">
    <three-game bind:this={game}>
      <three-scene bind:this={scene}
        background-color="#222"> <!-- camera="#camera" -->
        <three-perspective-camera bind:this={perspectiveCamera}
          id="perspective"
          args="45 2 0.1 1000"
          position={[-1, 2, 6]}/> <!-- args="45 2 0.1 1000" -->
        <three-orthographic-camera bind:this={orthographicCamera}
          id="orthographic"
          far={1000}
          near={-1000}
          up={[0, 0, 1]}
          position={[-1, 2, 6]}/>
        <three-orbit-controls bind:this={controls} />

        <Lights />
        <!-- <Thingy color="red" scale=2 position={[-1, 1, 0]} />
        <Thingy color="yellow" scale=20 position={[10, -10, -90]} /> -->

        <Stage bind:this={stage1} position={[-2.1, 0,  2.1]} color="#dad" selectedColor="magenta"/>
        <Stage bind:this={stage2} position={[ 2.1, 0,  2.1]} color="#ada" selectedColor="green"/>
        <Stage bind:this={stage3} position={[-2.1, 0, -2.1]} color="#dda" selectedColor="yellow"/>
        <Stage bind:this={stage4} position={[ 2.1, 0, -2.1]} color="#add" selectedColor="cyan"/>
      </three-scene>
    </three-game>
</div>

<div class="info">
  {#if recording1Loaded}
  <button on:click={recording1.step(0.1)}>Step</button>
  <div>{$recording1.tracker_1.elements[0]}</div>
  {/if}
</div>

<div class="menu">
  <button on:click={() => loadRecording("data/mml_micro_1.1_2.log")}>Load Recording</button>
  <button on:click={toggleCamera}>Toggle Camera</button>
  <button on:click={zoomExtent}>Zoom to Fit</button>
  <div>
    Number of stages:
    <input type="number" min="1" max="4" bind:value={nStages} />
  </div>
</div>