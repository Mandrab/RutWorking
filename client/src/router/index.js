import Vue from "vue";
import VueRouter from "vue-router";
import LoginPage from "../views/LoginPage.vue";
import HomePage from "../views/HomePage.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: HomePage,
    meta: {
      title: 'Home Page | RutWorking',
    }
  },
  {
    path: "/login",
    name: "LoginPage",
    component: LoginPage,
    meta: {
      title: 'Login | RutWorning',
    }
  },
  {
    path: "/personalarea",
    name: "PersonalArea",
    meta: {
      title: 'Personal Area | RutWorking',
    },
    component: () =>
      import(/* webpackChunkName: "register" */ "../views/PersonalArea.vue") // lazy loading
  },
  {
    path: "/workingarea",
    name: "WorkingArea",
    meta: {
      title: 'Kanban | RutWorking',
    },
    component: () =>
      import(/* webpackChunkName: "register" */ "../views/WorkingArea.vue") // lazy loading
  },
  {
    path: "/adminpage",
    name: "AdminPage",
    meta: {
      title: 'Home Page | RutWorking',
    },
    component: () =>
      import(/* webpackChunkName: "register" */ "../views/AdminPage.vue") // lazy loading
  },
  {
    path: "/404",
    name: "PageNotFound",
    meta: {
      title: 'Page Not Found | RutWorking',
    },
    component: () =>
      import(/* webpackChunkName: "register" */ "../views/PageNotFound.vue") // lazy loading
  },
  // otherwise redirect to error page
  { path: '*', redirect: '/404' }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  document.title = to.meta.title;

  next();
})

export default router;
