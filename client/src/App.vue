<template>
  <div class="jumbotron" id="app">
    <router-view/>
  </div>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 20px;
}

@media (max-width: 576px) {
    .jumbotron {
      padding: 0px !important;
    }
}
</style>
