<template>
  <div class="ChampionsTab">
    <div v-for="(champion, index) in championsData" :key="champion.id">
      <ChampionCard v-bind:name="championsData[index]?.name" v-bind:pictureUrl="championsData[index]?.pictureUrl"/>
    </div>
  </div>
</template>

<script>
import ChampionCard from './ChampionCard.vue'
import { getChampionsData } from "@/services/championsAPI.js"

export default {
  name: 'ChampionsTab',
  components: {
    ChampionCard
  },
  data() {
    return {
      championsData: []
    }
  },
  created: function() {
    this.retrieveChampionsData()
  },
  methods: {
    async retrieveChampionsData() {
      this.championsData = await getChampionsData()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ChampionsTab {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5em;
  flex-wrap: wrap;
}
</style>
