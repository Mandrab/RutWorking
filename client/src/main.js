import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueResource from "vue-resource";

import VeeValidate from 'vee-validate';
Vue.use(VeeValidate);
Vue.use(VueResource);

import { DropdownPlugin } from 'bootstrap-vue'
Vue.use(DropdownPlugin)

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
