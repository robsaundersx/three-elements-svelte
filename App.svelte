<script>
  import Lights from "./Lights";
  import Thingy from "./Thingy";
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
  <three-scene>
    <Lights />

    <Thingy color="red" scale=2 position={[-1, 1, 0]} />
    <Thingy color="yellow" scale=20 position={[10, -10, -90]} />
    
    <three-orbit-controls />
  </three-scene>

</three-game>
