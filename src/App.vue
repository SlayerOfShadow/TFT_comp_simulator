<template>
  <div>
    <img src="./assets/logo_tft.png" alt="logo" id="logo">
  </div>
  <div class="Tabs">
    <div class="AllChampionsTab">
      <ChampionsTab class="Tab1" :cards="cards" @card-selected="addToSelected" :title="'Champions'" :searchTerm="searchTerm"/>
      <div class="Buttons">
        <button :class="{ active: sortBy === 'name' }" @click="orderCardsByName">A-Z</button>
        <button :class="{ active: sortBy === 'cost' }" @click="orderCardsByCost">Cost</button>
        <input v-model="searchTerm" placeholder="Search champions...">
        <span class="search-clear" v-if="searchTerm" @click="searchTerm = ''">X</span>
      </div>
    </div>
    <div class="SelectedTab">
      <ChampionsTab class="Tab2" :cards="selectedCards" @card-selected="removeFromSelected" :title="'Composition'" :searchTerm="''"/>
      <div class="ActiveTraits">
        <h3>Traits</h3>
        <div class="TraitsContainer">
          <div class="Traits" v-for="(count, trait) in sortedTraitCounts" :key="trait" :class="{ 'trait-inactive': !isTraitActive(trait, count) }">
            <img class="TraitImg" :src="traitIconUrl + convertTraitPng(traits.find(t => t.name === trait).icon)" alt="trait icon">
            {{ trait }} : {{ count }} / {{ getNextTraitMinUnits(trait, count) }}
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
    this.retrieveTftData();
  },
  computed: {
    filteredCards() {
      return this.cards.filter(card => card.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    },
    traitCounts() {
      const counts = {};
      for (let trait of this.activeTraits) {
        counts[trait] = (counts[trait] || 0) + 1;
      }
      return counts;
    },
    sortedTraitCounts() {
      return Object.entries(this.traitCounts)
        .sort((a, b) => {
          const isActiveA = this.isTraitActive(a[0], a[1]);
          const isActiveB = this.isTraitActive(b[0], b[1]);
          if (isActiveA === isActiveB) {
            return 0;
          } else if (isActiveA) {
            return -1;
          } else {
            return 1;
          }
        })
        .reduce((obj, [trait, count]) => {
          obj[trait] = count;
          return obj;
        }, {});
    }
  },
  methods: {
    async retrieveTftData() {
      this.tftData = await getTftData();
      this.cards = this.tftData["sets"]["8"]["champions"];
      this.traits = this.tftData["sets"]["8"]["traits"];
      this.orderCardsByName();
    },
    convertTraitPng(file) {
      file = file.substr(0, file.indexOf(".")) + ".png";
      return file.toLowerCase();
    },
    addToSelected(index) {
      if (this.selectedCards.length < 28)
      {
        this.cards[index]["traits"].forEach(element => {
          this.activeTraits.push(element);
        });
        this.selectedCards.push(this.cards[index]);
        this.cards.splice(index, 1);
      }
    },
    removeFromSelected(index) {
      const card = this.selectedCards[index];
      card.traits.forEach(trait => {
        const traitIndex = this.activeTraits.indexOf(trait);
        if (traitIndex !== -1) {
          this.activeTraits.splice(traitIndex, 1);
        }
      });
      this.cards.push(this.selectedCards[index]);
      this.selectedCards.splice(index, 1);
      if (this.sortBy === 'name') {
        this.orderCardsByName();
      } else {
        this.orderCardsByName();
        this.orderCardsByCost();
      }
    },
    orderCardsByName() {
      this.cards.sort((a, b) => a.name.localeCompare(b.name));
      this.sortBy = 'name';
    },
    orderCardsByCost() {
      this.cards.sort((a, b) => a.cost - b.cost);
      this.sortBy = 'cost';
    },
    getNextTraitMinUnits(trait, currentCount) {
      const traitEffects = this.traits.find(t => t.name === trait).effects;
      const nextEffect = traitEffects.find(e => e.minUnits > currentCount);
      return nextEffect ? nextEffect.minUnits : traitEffects[traitEffects.length - 1].minUnits;
    },
    isTraitActive(trait, count) {
      const traitData = this.traits.find(t => t.name === trait);
      if (traitData.name === "Ace") {
        return traitData.effects.some(effect => count === effect.minUnits);
      }
      return count >= traitData.effects[0].minUnits;
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

.Buttons {
  display: flex;
  align-items: center; /* vertically center items */
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
  font-size: 2rem;
  white-space: nowrap;
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
  padding: 0.5em 1em;
  width: 100%;
}

.AllChampionsTab {
  margin-left: 2em;
  margin-right: 1em;
}

.SelectedTab {
  margin-left: 1em;
  margin-right: 2em;
}

.search-clear {
  font-family: 'Montserrat', sans-serif;
}

.TraitsContainer {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.Traits {
  border: 0.1em solid rgb(255, 255, 255);
  display: flex;
  font-size: 1.5rem;
  padding: 0.5em;
  margin-bottom: 0.5em;
}

.trait-inactive {
    opacity: 0.5;
  }

.TraitImg {
  margin-right: 0.5em;
}
</style>
