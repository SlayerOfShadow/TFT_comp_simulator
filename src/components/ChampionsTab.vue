<template>
  <div>
    <h3>{{ title }}</h3>
    <div class="ChampionsTab">
      <div class = "Card" v-for="(champion, index) in cards" :key="champion.id">
        <ChampionCard v-if="cards[index]?.traits.length !== 0"
        @click="selectCard(index)"
        v-bind:name="cards[index]?.name" 
        v-bind:pictureUrl="iconUrl + convertPng(cards[index]?.icon)"
        v-bind:cost="cards[index]?.cost"
        :style="{ opacity: isMatch(champion.name) ? 1 : 0.3 }"/>
      </div>
    </div>
  </div>
</template>

<script>
import ChampionCard from './ChampionCard.vue'

export default {
  name: 'ChampionsTab',
  components: {
    ChampionCard
  },
  data() {
    return {
      iconUrl: "https://raw.communitydragon.org/13.5/game/"
    }
  },
  props: {
    title: {required: true},
    cards: {required: true},
    searchTerm: {type: String}
  },
  methods: {
    convertPng(file) {
      file = file.substr(0, file.indexOf(".")) + "_square.tft_set8.png";
      return file.toLowerCase();
    },
    selectCard(index) {
      this.$emit('card-selected', index)
    },
    isMatch(name) {
      return name.toLowerCase().includes(this.searchTerm.toLowerCase())
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ChampionsTab {
  border: 0.25em solid rgb(33, 44, 48);
  background-color: rgb(27, 37, 39);
  margin: 1em;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
}

.Card:hover {
  opacity: 0.6;
}
</style>
