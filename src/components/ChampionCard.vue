<template>
  <div class="ChampionCard" :style="{ borderColor: getBorderColor }">
    <img class="picture" v-bind:src="pictureUrl"/>
  </div>
</template>

<script>
export default {
  name: 'ChampionCard',
  props: {
    name: {required: true},
		pictureUrl: {type: String, default:"https://my-best-kennel.com/pictures/default.png"},
    cost: {required: true}
	},
  computed: {
    getBorderColor() {
      switch(this.cost) {
        case 1:
          return 'rgb(105,105,105)'; // Grey
        case 2:
          return 'rgb(0,128,0)'; // Green
        case 3:
          return 'rgb(30,130,255)'; // Blue
        case 4:
          return 'rgb(200,0,200)'; // Violet
        case 5:
          return 'rgb(255,200,0)'; // Gold
        default:
          return 'rgb(105,105,105)'; // Grey
      }
    }
  }
}
</script>

<style scoped>
.ChampionCard {
  width: 4rem;
  height: 4rem;
  margin: 0.6em;
  border: 0.05em solid;
}

img {
  width: 100%;
  height: 100%;
}

img:hover {
  opacity: 0.5;
}

</style>
