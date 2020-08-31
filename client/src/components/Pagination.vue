<template>
<ul class="pagination margin-bottom-none" v-if="pages > 1" :class="{'bottom': bottom == true, 'doFloat': doNotFloat != true}">
  <!-- Left arrow disabled if the first tag is active -->
  <li :class="{disabled: this.active == 0}" @click.prevent="checkArrows(false)"><a href="#">&laquo;</a></li>
  <!-- The first and last tags are always shown, even when you specify to display a maximum number of tags -->
  <li v-if="!firstCovered" @click.prevent="showProjects(0)"><a href="#">1</a></li>
  <!-- The suspension points appear if the first tag is not immediately before the frame of tags shown -->
  <li v-if="firstUnreached"><a @click.prevent="showProjects(firstDisplayed - 1)">...</a></li>
  <!-- Iterates the tags to show (all tags if the shown prop is not valued) -->
  <li v-for="(showed, index) in displayed" :key="index" @click.prevent="showProjects(showed)" :class="{active: showed==active}"><a href="#">{{ showed + 1 }}</a></li>
  <!-- The suspension points appear if the last tag is not immediately after the frame of tags shown -->
  <li v-if="lastUnreached"><a @click.prevent="showProjects(lastDisplayed + 1)">...</a></li>
  <!-- Last tag always visible -->
  <li v-if="!lastCovered" @click.prevent="showProjects(pages - 1)"><a href="#">{{pages}}</a></li>
  <!-- Right arrow disabled if the last tag is active -->
  <li :class="{disabled: this.active == pages - 1}" @click.prevent="checkArrows(true)"><a href="#">&raquo;</a></li>
</ul>
</template>
<script>

export default {
  data: function() {
    return {
      active: 0,
      pages: 0,
      displayed: []
    }
  },
  props: ["array", "limit", "large", "bottom", "shown", "doNotFloat"],
  watch: {
    'array': function() {
      this.pages = 0;
      this.handleProjects();
      this.showProjects(0);
    }
  },
  methods: {
    // Compute the number of tags to divide the array into
    handleProjects: function() {
      if (this.array.length > 0) {
        this.pages = Math.ceil(this.array.length / this.limit);
      }
    },
    // Select the fraction of array to show, and update the active index
    showProjects: function(index) {
      this.active = index;
      var displayProjects;
      if (index != this.pages - 1) {
        displayProjects = this.array.slice(index * this.limit, (index + 1) * this.limit);
      } else {
        displayProjects = this.array.slice(index * this.limit, this.array.length);
      }
      this.$emit("displayChanged", displayProjects);

      this.displayed = [];
      if (this.shown == null || this.pages <= this.shown) {
        for (var i = 0; i < this.pages; i++) {
          this.displayed.push(i);
        }
      } else {
        var half = Math.floor(this.shown / 2);
        var starting, ending;
        if (this.active <= half) {
          starting = 0;
          ending = this.shown;
        } else {
          if (this.active >= this.pages - half) {
            starting = this.pages - this.shown;
            ending = this.pages;
          } else {
            starting = this.active - half;
            ending = this.active + half + 1;
          }
        }
        for (var ii = starting; ii < ending; ii++) {
          this.displayed.push(ii);
        }
      }
    },
    checkArrows: function(isRight) {
      if (isRight) {
        if (this.active < this.pages - 1) {
          this.showProjects(this.active + 1);
        }
      } else if (this.active > 0) {
        this.showProjects(this.active - 1);
      }
    }
  },
  computed: {
    firstCovered: function() {
      return this.firstDisplayed == 0;
    },
    lastCovered: function() {
      return this.lastDisplayed == this.pages - 1;
    },
    firstUnreached: function() {
      return this.firstDisplayed > 1;
    },
    lastUnreached: function() {
      return this.lastDisplayed < this.pages - 2;
    },
    firstDisplayed: function() {
      return this.displayed[0];
    },
    lastDisplayed: function() {
      return this.displayed[this.displayed.length - 1];
    }
  },
  mounted: function() {
    this.$nextTick(function() {
    this.handleProjects();
    this.showProjects(this.active);
    })
  }
}
</script>
<style scoped>
.pagination li a {
  margin-top: 10px;
  border-radius: 10%;
  font-size: 1rem;
  font-weight: 300;
  padding: 2px 5px 2px 5px;
}

.bottom {
  margin-top: 5px;
  margin-bottom: 10px !important;
}

.doFloat {
  float: right;
}
</style>