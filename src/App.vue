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
      <div class="SelectedTabButtons">
        <button class="ClearButton" @click="removeAllFromSelected">Clear composition</button>
        <div class="SelectedChampionsCount">{{ selectedCards.length }} / 10</div>
      </div>
      <div class="ActiveTraits">
        <h1>Traits</h1>
        <div class="TraitsContainer">
          <div class="Traits" v-for="(count, trait) in sortedTraitCounts" :key="trait" :class="{ 'trait-inactive': !isTraitActive(trait, count) }" :style="{ borderColor: isTraitActive(trait, count) ? getTraitBorderColor(trait, count) : 'rgb(255, 255, 255)' }">
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

          // Order by style in descending order
          if (styleA && styleB) {
            if (styleA > styleB) {
              return -1;
            } else if (styleA < styleB) {
              return 1;
            }
          }

          // Otherwise, sort by whether the trait is active
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
      const traitEffects = traitObject.effects.slice().reverse(); // Reverse the array of effects
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

html,body{
  margin: 0;
  padding: 0;
}

body{
  background-color: rgb(41, 55, 59);
}

#app {
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 2em;
  color: white;
}

#logo {
  width: 500px;
  filter: drop-shadow(5px 5px 5px #222);
}

.Tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  filter: drop-shadow(5px 5px 5px #222);
}

.AllChampionsTab {
  margin-left: 2em;
  margin-right: 1em;
}

.SelectedTab {
  margin-left: 1em;
  margin-right: 2em;
}

@media (max-width: 1000px) {
  .Tabs {
    grid-template-columns: 1fr;
  }
  .AllChampionsTab {
    margin-left: 2em;
    margin-right: 2em;
  }

  .SelectedTab {
    margin-left: 2em;
    margin-right: 2em;
  }

}

button {
  font-family: 'Montserrat', sans-serif;
  border: 0.25em solid rgb(33, 44, 48);
  background-color: rgb(27, 37, 39);
  color: white;
  padding: 0.5em 1em;
  font-size: 1.5rem;
  white-space: nowrap;
}

.Buttons {
  display: flex;
  align-items: center; /* vertically center items */
  position: relative;
}

input {
  border: 0.25em solid rgb(33, 44, 48);
  background-color: rgb(27, 37, 39);
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  padding-left: 0.5em;
  padding-right: 2em;
  width: 100%;
  position: relative;
}

.Buttons button.active {
  background-color: #444;
}

.SelectedTabButtons {
  display: flex;
  align-items: center; /* vertically center items */
  font-size: 1.5rem;
}

.ClearButton {
  width: 100%;
}

.SelectedChampionsCount {
  white-space: nowrap;
  background-color: rgb(33, 44, 48);
  padding: 0.5em 1em;
  border: 0.25em solid rgb(33, 44, 48);
}

button:hover {
  background-color: #333;
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

.TraitsContainer {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1em; /* Add a gap of 1em between the items */
  max-height: 360px;
  overflow-y: auto;
  padding-right: 10px; /* add 10px padding to the right */
}

@media (max-width: 1000px) {
  .TraitsContainer {
    grid-template-columns: 1fr 1fr;
  }
}

.TraitsContainer::-webkit-scrollbar {
  width: 0.5em;
}

.TraitsContainer::-webkit-scrollbar-track {
  background: rgb(27, 37, 39);
}

.TraitsContainer::-webkit-scrollbar-thumb {
  background: #888;
}

.TraitsContainer::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.Traits {
  border: 0.1em solid rgb(255, 255, 255);
  display: flex;
  font-size: 1rem;
  padding: 0.5em;
  margin-bottom: 0.5em;
  background-color: rgb(27, 37, 39);
  filter: drop-shadow(5px 5px 5px #222);
  align-items: center; /* Add this line to vertically align the contents */
}

.trait-inactive {
    opacity: 0.3;
  }

.TraitImg {
  margin-right: 0.5em;
}
</style>
