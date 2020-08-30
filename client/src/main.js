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

import VueAwesomeSwiper from 'vue-awesome-swiper'
// import style
import 'swiper/swiper.scss'
// If you use Swiper 6.0.0 or higher
import 'swiper/swiper-bundle.css'
Vue.use(VueAwesomeSwiper)


//import VueWindowSize from 'vue-window-size';
//Vue.use(VueWindowSize);

import Chat from 'vue-beautiful-chat'
Vue.use(Chat)


import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserSecret, faUser, faUserPlus, faTimes, faTrashAlt, faAngleLeft, faAngleRight, faPlus, faBars, faEllipsisH, faBan, faSignOutAlt, faHome, faBell, faSpinner, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faUserSecret, faUser, faUserPlus, faTimes, faTrashAlt, faAngleLeft, faAngleRight, faPlus, faBars, faEllipsisH, faBan, faSignOutAlt, faHome, faBell, faSpinner, faCircleNotch)

Vue.component('font-awesome-icon', FontAwesomeIcon)


Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
