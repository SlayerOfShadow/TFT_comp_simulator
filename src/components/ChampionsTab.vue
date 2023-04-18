<template>
  <div>
    <h1>{{ title }}</h1>
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
      iconUrl: "https://raw.communitydragon.org/13.6/game/"
    }
  },
  props: {
    title: {required: true},
    cards: {required: true},
    searchTerm: {type: String}
  },
  methods: {
    convertPng(file) {
      let file1, file2;
      file1 = file.substr(0, file.indexOf("."));
      file2 = file.substring(file.indexOf(".") + 1);
      if (file2 == "TFT_Set8_Stage2.dds")
      {
        return file1.toLowerCase() + "_mobile.tft_set8_stage2.png";
      } else {
        return file1.toLowerCase() + "_square.tft_set8.png";
      }
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

<style scoped>
.ChampionsTab {
  border: 0.2em solid rgb(40, 50, 70);
  background-color: rgb(20, 30, 50);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
