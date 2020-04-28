import Vue from "vue";
import App from "./App.vue";
import VueRouter from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";
import Room from "./components/Room.vue";
import { BootstrapVue } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

// https://github.com/dannydenenberg/Vue-Socket.io => for reference
import VueSocketIO from "vue-socket.io";

// TODO: CHANGE THIS FOR PRODUCTION.
export const serverURL = "http://192.168.1.13:5000";

// create a socket.io implementation with vue.
// Each component can call this.$socket.emit(...)
// Each component can have an object called `socket` with properties of the names of .on catches from server
Vue.use(
  new VueSocketIO({
    debug: true,
    connection: serverURL,
  })
);

// Install BootstrapVue
Vue.use(BootstrapVue);

// Optionally install the BootstrapVue icon components plugin
// import {IconsPlugin} from "bootstrap-vue";
// Vue.use(IconsPlugin);

// https://www.youtube.com/watch?v=4lk9-PYensI
Vue.use(VueRouter);

Vue.config.productionTip = false;

const routes = [
  { path: "/", component: HelloWorld },
  { path: "/:room", component: Room },
];

const router = new VueRouter({
  routes,
  mode: "history",
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
