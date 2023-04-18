<template>
  <header>
    <img src="./assets/logo_tft.png" alt="logo" id="logo">
  </header>
  <div class="Tabs">
    <div class="SelectTab">
      <ChampionsTab class="Tab1" :cards="cards" @card-selected="addToSelected" :title="'CHAMPIONS'" :searchTerm="searchTerm"/>
      <div class="SelectTabButtons">
        <button :class="{ active: sortBy === 'name' }" @click="orderCardsByName">A-Z</button>
        <button :class="{ active: sortBy === 'cost' }" @click="orderCardsByCost">Cost &#8595;</button>
        <input v-model="searchTerm" placeholder="Search champions...">
        <span class="search-clear" v-if="searchTerm" @click="searchTerm = ''">X</span>
      </div>
    </div>
    <div class="SelectedTab" ref="selectedTab">
      <ChampionsTab class="Tab2" :cards="selectedCards" @card-selected="removeFromSelected" :title="'COMPOSITION'" :searchTerm="''"/>
      <div class="SelectedTabButtons">
        <button class="ClearButton" @click="removeAllFromSelected">Clear composition</button>
        <div class="SelectedChampionsCount">{{ selectedCards.length }} / 10</div>
      </div>
      <div class="ActiveTraits">
        <h1>TRAITS</h1>
        <div class="TraitsContainer" v-if="selectedCards.length > 0">
          <div class="Traits" v-for="(count, trait) in sortedTraitCounts" :key="trait" :class="{ 'trait-inactive': !isTraitActive(trait, count) }" :style="{ borderColor: isTraitActive(trait, count) ? getTraitBorderColor(trait, count) : 'rgb(255, 255, 255)' }">
            <img class="TraitImg" :src="traitIconUrl + convertTraitPng(traits.find(t => t.name === trait).icon)" alt="trait icon">
            {{ trait }} : {{ count }} / {{ getNextTraitMinUnits(trait, count) }}
          </div>
        </div>
        <div v-else>
          <p class="NoTraits">&#9888; <br> No active trait</p>
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
      traitIconUrl: 'https://raw.communitydragon.org/13.6/game/',
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
          const traitA = this.traits.find(t => t.name === a[0]);
          const traitB = this.traits.find(t => t.name === b[0]);
          const effectA = traitA.effects.filter(e => e.minUnits <= a[1]).sort((a, b) => b.minUnits - a.minUnits)[0] || {};
          const effectB = traitB.effects.filter(e => e.minUnits <= b[1]).sort((a, b) => b.minUnits - a.minUnits)[0] || {};
          const styleA = effectA.style;
          const styleB = effectB.style;

          if (styleA && styleB) {
            if (traitA.name === 'Threat') {
              return 1;
            } else if (traitB.name === 'Threat') {
              return -1;
            } else if (styleA > styleB) {
              return -1;
            } else if (styleA < styleB) {
              return 1;
            }
          }

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
      file = file.substr(0, file.lastIndexOf(".")) + ".png";
      return file.toLowerCase();
    },
    addToSelected(index) {
      if (this.selectedCards.length < 10)
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
    removeAllFromSelected() {
      for (let i = this.selectedCards.length - 1; i >= 0; i--) {
        this.removeFromSelected(i);
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
    },
    getTraitBorderColor(trait, currentCount) {
      if (trait === "Threat")
          {
            return 'rgb(102,36,168)';
          }
      const traitObject = this.traits.find(t => t.name === trait);
      if (!traitObject) {
        return null;
      }
      const traitEffects = traitObject.effects.slice().reverse();
      const currentEffect = traitEffects.find(e => e.minUnits <= currentCount);
      if (!currentEffect) {
        return null;
      }
      const currentStyle = currentEffect.style;
      switch (currentStyle)
      {
        case 1:
          return 'rgb(139,69,19)'; // Bronze
        case 3:
          return 'rgb(192,192,192)'; // Silver
        case 4:
          return 'rgb(255,235,0)'; // Gold
        case 5:
          return 'rgb(219,233,244)'; // Prismatic
        default:
          return 'rgb(255,255,255)'; // White
      }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300&display=swap');

#app {
  font-family: 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
}

html,body {
  margin: 0;
  padding: 0;
}

header {
  background-color: rgb(40, 50, 70);
  border-bottom: 1px solid white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  padding: 30px;
}

#logo {
  width: 350px;
  filter: drop-shadow(2px 2px 5px #000000);
}

body{
  background-color: rgb(30, 40, 60);
}

h1 {
  margin: 40px;
}

.Tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  filter: drop-shadow(2px 2px 5px #000000);
}

.SelectTab {
  margin-left: 4em;
  margin-right: 2em;
}

.SelectedTab {
  margin-left: 2em;
  margin-right: 4em;
}

button {
  font-family: 'Montserrat', sans-serif;
  border: 0.2em solid rgb(40, 50, 70);
  background-color: rgb(60, 70, 90);
  color: white;
  padding: 0.5em 1em;
  font-size: 1.5rem;
  white-space: nowrap;
}

button:hover {
  background-color: rgb(80, 90, 110);
}

.SelectTabButtons {
  display: flex;
  align-items: center;
  position: relative;
}

.SelectTabButtons button.active {
  background-color: rgb(90, 100, 120);
}

input {
  border: 0.2em solid rgb(40, 50, 70);
  background-color: rgb(30, 40, 60);
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  padding-left: 0.5em;
  padding-right: 2em;
  width: 100%;
}

.search-clear {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  position: absolute;
  top: 50%;
  right: 2.5%;
  transform: translateY(-50%);
  cursor: pointer;
}

.SelectedTabButtons {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
}

.ClearButton {
  width: 100%;
}

.SelectedChampionsCount {
  white-space: nowrap;
  background-color: rgb(40, 50, 70);
  padding: 0.5em 1em;
  border: 0.2em solid rgb(40, 50, 70);
}

.TraitsContainer {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1em;
  max-height: 290px;
  overflow-y: auto;
  padding-right: 10px;
}

.TraitsContainer::-webkit-scrollbar {
  width: 0.2em;
}

.TraitsContainer::-webkit-scrollbar-track {
  background: rgb(30, 40, 60);
}

.TraitsContainer::-webkit-scrollbar-thumb {
  background: white;
}

.TraitsContainer::-webkit-scrollbar-thumb:hover {
  background: #777777;
}

.Traits {
  border: 0.1em solid rgb(255, 255, 255);
  display: flex;
  font-size: 1rem;
  padding: 0.5em;
  margin-bottom: 0.5em;
  background-color: rgb(30, 40, 60);
  filter: drop-shadow(1px 1px 1px #000000);
  align-items: center;
}

.trait-inactive {
    opacity: 0.3;
  }

.TraitImg {
  margin-right: 0.5em;
}

.NoTraits {
  font-size: 1.5rem;
  opacity: 0.3;
}

/* RESPONSIVE */

@media (max-width: 1320px) {
  .Tabs {
    grid-template-columns: 1fr;
  }
  .SelectTab {
    margin-left: 3em;
    margin-right: 3em;
  }
  .SelectedTab {
    margin-left: 3em;
    margin-right: 3em;
  }
}

@media (max-width: 1000px) {
  .TraitsContainer {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .TraitsContainer {
    grid-template-columns: 1fr;
  }
}

</style>