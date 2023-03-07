<template>
  <div class="ChampionCard">
    <h2 class="name">{{name}}</h2>
    <img class="picture" v-bind:src="pictureUrl"/>
  </div>
</template>

<script>
export default {
  name: 'ChampionCard',
  props: {
    id: {type: Number, required: true},
		name: {type: String, required: true},
		pictureUrl: {type: String, default:"https://my-best-kennel.com/pictures/default.png"}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ChampionCard {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

h2 {
  width: 100%;
}
</style>
