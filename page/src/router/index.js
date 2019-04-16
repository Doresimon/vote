import Vue from "vue";
import Router from "vue-router";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import Manage from "@/components/Manage";
import Execute from "@/components/Execute";

// 1. Use plugin.
// This installs <router-view> and <router-link>,
// and injects $router and $route to all router-enabled child components
Vue.use(Router);

// 3. Create the router
const router = new Router({
  // mode: "history",
  // base: __dirname,
  routes: [
    { name: "home", path: "/", component: Login },
    { name: "login", path: "/login", component: Login },
    { name: "dashboard", path: "/dashboard", component: Dashboard },
    { name: "manage", path: "/manage/:id", component: Manage, props: true },
    { name: "execute", path: "/execute/:id", component: Execute, props: true }
  ]
});

export default router;
