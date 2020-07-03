import Vue from "vue";
import VueRouter from "vue-router";
import LoginPage from "../views/LoginPage.vue";
//import RegisterPage from "../views/RegisterPage.vue";
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
  // otherwise redirect to home
  { path: '*', redirect: '/' }
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
