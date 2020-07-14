import Vue from "vue";
import VueRouter from "vue-router";
import LoginPage from "../views/LoginPage.vue";
import HomePage from "../views/HomePage.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: HomePage
  },
  {
    path: "/login",
    name: "LoginPage",
    component: LoginPage
  },
  {
    path: "/register",
    name: "RegisterPage",
    component: () =>
      import(/* webpackChunkName: "register" */ "../views/RegisterPage.vue") // lazy loading
  },
  {
    path: "/personalarea",
    name: "PersonalArea",
    component: () =>
      import(/* webpackChunkName: "register" */ "../views/PersonalArea.vue") // lazy loading
  },
  {
    path: "/workingarea",
    name: "WorkingArea",
    component: () =>
      import(/* webpackChunkName: "register" */ "../views/WorkingArea.vue") // lazy loading
  },
  {
    path: "/404",
    name: "PageNotFound",
    component: () =>
      import(/* webpackChunkName: "register" */ "../views/PageNotFound.vue") // lazy loading
  },
  // otherwise redirect to home
  { path: '*', redirect: '/404' }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  next();
})

export default router;
