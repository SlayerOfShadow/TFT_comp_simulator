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
      // Set border color based on the cost prop
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ChampionCard {
  width: 4rem;
  height: 4rem;
  margin: 0.3rem;
  border: 0.05em solid rgb(33, 44, 48);
}

img {
  width: 100%;
  height: 100%;
}

</style>
