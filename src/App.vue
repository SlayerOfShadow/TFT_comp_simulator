<template>
  <div>
    <img src="./assets/logo_tft.png" alt="logo" id="logo">
  </div>
  <div>
    <ChampionsTab/>
  </div>
</template>

<script>
import ChampionsTab from './components/ChampionsTab.vue'

export default {
  name: 'App',
  components: {
    ChampionsTab
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300&display=swap');

body{
  background-color: rgb(41, 55, 59);
}

#app {
  font-family: 'Montserrat', sans-serif;
  font-size: 2rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 1.5em;
  color: white;
}

#logo {
  width: 30%;
  filter: drop-shadow(5px 5px 5px #222);
}
</style>
