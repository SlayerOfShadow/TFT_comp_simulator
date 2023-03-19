<template>
  <div>
    <img src="./assets/logo_tft.png" alt="logo" id="logo">
  </div>
  <div class="Tabs">
    <div class="AllChampionsTab">
      <ChampionsTab :cards="cards" @card-selected="addToSelected" :title="'Champions'" :searchTerm="searchTerm"/>
      <div class="Buttons">
        <button :class="{ active: sortBy === 'name' }" @click="orderCardsByName">A-Z</button>
        <button :class="{ active: sortBy === 'cost' }" @click="orderCardsByCost">Cost</button>
        <input v-model="searchTerm" placeholder="Search champions...">
        <span class="search-clear" v-if="searchTerm" @click="searchTerm = ''">X</span>
      </div>
    </div>
    <div class="SelectedTab">
      <ChampionsTab :cards="selectedCards" @card-selected="removeFromSelected" :title="'Composition'" :searchTerm="''"/>
      <div class="ActiveTraits">
        <h3>Traits</h3>
        <div class="TraitsContainer">
          <div class="Traits" v-for="(count, trait) in traitCounts" :key="trait">
            <img :src="traitIconUrl + convertTraitPng(traits.find(t => t.name === trait).icon)" alt="trait icon">
            {{ trait }} : {{ count }}&nbsp;&nbsp;|&nbsp;&nbsp;
            <span v-if="traits.find(t => t.name === trait).effects">
              {{ traits.find(t => t.name === trait).effects.map(effect => effect.minUnits).join(' > ') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChampionsTab from './components/ChampionsTab.vue'
import { getTftData } from "@/services/championsAPI.js"

export default {
  name: 'App',
  components: {
    ChampionsTab
  },
  data() {
    return {
      tftData: [], 
      cards: [], 
      selectedCards: [],
      searchTerm: '',
      traits: [],
      activeTraits: [],
      traitIconUrl: 'https://raw.communitydragon.org/13.5/game/',
      sortBy: 'name'
    }
  },
  created: function() {
    this.retrieveTftData()
  },
  computed: {
    filteredCards() {
      return this.cards.filter(card => card.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
    },
    traitCounts() {
      const counts = {}
      for (let trait of this.activeTraits) {
        counts[trait] = (counts[trait] || 0) + 1
      }
      return counts
    }
  },
  methods: {
    async retrieveTftData() {
      this.tftData = await getTftData()
      this.cards = this.tftData["sets"]["8"]["champions"]
      this.traits = this.tftData["sets"]["8"]["traits"]
      this.orderCardsByName()
    },
    convertTraitPng(file) {
      file = file.substr(0, file.indexOf(".")) + ".png";
      return file.toLowerCase();
    },
    addToSelected(index) {
      this.cards[index]["traits"].forEach(element => {
        this.activeTraits.push(element)
      });
      this.selectedCards.push(this.cards[index])
      this.cards.splice(index, 1)
    },
    removeFromSelected(index) {
      const card = this.selectedCards[index];
      card.traits.forEach(trait => {
        const traitIndex = this.activeTraits.indexOf(trait);
        if (traitIndex !== -1) {
          this.activeTraits.splice(traitIndex, 1);
        }
      });
      this.cards.push(this.selectedCards[index])
      this.selectedCards.splice(index, 1)
      if (this.sortBy === 'name') {
        this.orderCardsByName()
      } else {
        this.orderCardsByName()
        this.orderCardsByCost()
      }
    },
    orderCardsByName() {
      this.cards.sort((a, b) => a.name.localeCompare(b.name))
      this.sortBy = 'name'
    },
    orderCardsByCost() {
      this.cards.sort((a, b) => a.cost - b.cost)
      this.sortBy = 'cost'
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300&display=swap');

html,body{
  margin: 0;
  padding: 0;
}

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
  width: 25%;
  filter: drop-shadow(5px 5px 5px #222);
}

.Tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.Buttons button.active {
  background-color: #444;
}

button {
  font-family: 'Montserrat', sans-serif;
  border: 0.25em solid rgb(33, 44, 48);
  background-color: rgb(27, 37, 39);
  color: white;
  padding: 0.5em 1em;
  margin-right: 1em;
  font-size: 2rem;
}

button:hover {
  background-color: #333;
}

input {
  border: 0.25em solid rgb(33, 44, 48);
  background-color: rgb(27, 37, 39);
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-size: 2rem;
  padding: 0.5em;
  padding-right: 2em;
}

.Buttons {
  position: relative;
}

.search-clear {
  font-family: 'Montserrat', sans-serif;
  position: absolute;
  top: 50%;
  right: 100px;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 2rem;
}

.TraitsContainer {
  justify-content: center;
  margin-left: 1em;
}

.Traits {
  display: flex;
  align-items: center;
}
</style>
