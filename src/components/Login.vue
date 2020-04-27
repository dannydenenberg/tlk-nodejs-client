<template>
  <div>
    <div role="group">
      <div>
        <!-- <label for="input-live">Name:</label> -->
        <b-form-input
          class="w-25"
          id="input-live"
          v-model="name"
          :state="nameState"
          aria-describedby="input-live-help input-live-feedback"
          placeholder="Enter your name"
          trim
        ></b-form-input>

        <!-- This will only be shown if the preceding input has an invalid state -->
        <b-form-invalid-feedback id="input-live-feedback"
          >Enter at least 2 letters</b-form-invalid-feedback
        >

        <!-- This is a form text block (formerly known as help block) -->
        <b-form-text id="input-live-help">Your full name.</b-form-text>
      </div>
      <div>
        <b-form-input
          class="w-25"
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          :state="passwordState"
          aria-describedby="input-live-help input-live-feedback"
          placeholder="Password baybeee"
          trim
        ></b-form-input>
        <b-button variant="light" v-on:click="showPassword = !showPassword"
          >Show Password</b-button
        >
        <!-- This is a form text block (formerly known as help block) -->
        <b-form-text id="input-live-help">Good password.</b-form-text>
      </div>

      <br />
      <b-button variant="primary" v-on:click="login">Login</b-button>
    </div>
  </div>
</template>

<script>
import { setCookie, hash } from "./../crypto";
import { serverURL } from "./../main";

export default {
  props: ["hideLogin"],
  computed: {
    nameState() {
      return this.name.length > 1 ? true : false;
    },
    passwordState() {
      return this.password.length > 0 ? true : false;
    },
  },
  methods: {
    checkFields() {
      let name = this.name.length > 1 ? true : false;
      let password = this.password.length > 0 ? true : false;
      return name && password;
    },
    async login() {
      if (!this.checkFields()) {
        alert("fill out all fields");
        return;
      }

      // Set roomName, name, password
      let roomName = location.pathname.substring(1);
      setCookie("room", roomName, 365); // set room as cookie
      setCookie("name", this.name, 365);
      setCookie("password", hash(this.password), 365);

      console.log(
        `ROOM NAME: ${roomName}, NAME: ${this.name}, PASSWORD: ${this.password}`
      );

      let hashedPassword = hash(this.password);
      let res = await fetch(`${serverURL}/${roomName}`, {
        method: "post",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: hashedPassword,
        }),
      });

      let status = await res.status;

      if (status != 200) {
        // password was wrong.
        alert("wrong passcode");
        return;
      }

      // set the login to false to hide it and show the chat.
      this.hideLogin();
    },
  },
  async beforeMount() {
    // check for admin
    console.log("before mount!!");
  },
  sockets: {},
  data() {
    return {
      name: "",
      password: "",
      showPassword: false,
    };
  },
};
</script>
<style lang="sass"></style>
