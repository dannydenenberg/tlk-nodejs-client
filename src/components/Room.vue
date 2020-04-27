<template>
  <div class="room">
    <Navbar></Navbar>
    <div class="content">
      <Login v-bind:hideLogin="hideLogin" v-if="login"></Login>
      <Chat v-if="!login"></Chat>
    </div>
  </div>
</template>

<script>
import Navbar from "./Navbar";
import Login from "./Login";
import Chat from "./Chat";

export default {
  components: { Navbar, Login, Chat },
  methods: {
    hideLogin() {
      this.login = false;
    },
  },
  data() {
    return {
      login: true, // CHANGE THIS
    };
  },
  sockets: {
    connect: () => {
      console.log("Socket connected!!");
    },
  },
};
</script>

<style lang="scss" scoped>
.room {
  display: block;
}
</style>
