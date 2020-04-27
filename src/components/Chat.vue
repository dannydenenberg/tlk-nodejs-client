<template>
  <div class="container">
    <div id="group">
      <div class="users">
        <h4>Users</h4>
        <ul class="list-unstyled">
          <li v-for="person in people" :key="person">
            {{ person }}
          </li>
        </ul>
      </div>
      <div class="chat">
        <div class="messages">
          <ul class="list-unstyled">
            <li class="loadmessages">
              <b-button variant="secondary">Load Messages</b-button>
            </li>
            <!-- Check for the message from me (will be added only from client side) -->
            <li
              v-for="message in messages"
              :key="message.id"
              class="clearfix"
              :class="message.type == 'me' ? 'me' : ''"
            >
              <div class="name">{{ message.name }}</div>
              <span>{{ message.text }}</span>
            </li>
            <!-- <li class="me clearfix">
              <div class="name">a</div>
              <span>hey</span>
            </li> -->
          </ul>
        </div>
        <div class="input">
          <form>
            <div class="input-group">
              <input
                v-model="clientText"
                type="text"
                class="form-control"
                placeholder="היי אחי..."
              />
              <span class="input-group-btn">
                <button
                  v-on:click="sendMessage"
                  class="btn btn-default"
                  type="submit"
                >
                  -&gt;
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCookie, formatAMPM } from "./../crypto";
import {
  socket_routes,
  message_types,
  // message_types
} from "./../socketNames";

export default {
  // MUST by regular functions, NOT arrow functions.
  methods: {
    // client sends message.
    sendMessage(e) {
      e.preventDefault(); // prevent page reload

      // properties
      let text = this.clientText;
      let time = new Date().toString();
      let name = getCookie("name");
      let room = getCookie("room");
      let id = this.messages.length + 1; // NOT sent to server

      // add my text to the chat on current page
      this.messages.push({
        text,
        name,
        id,
        time,
        type: "me", // simply for clinet
      });

      // reset input
      this.clientText = "";

      // emit to server
      this.$socket.emit(socket_routes.CHAT_MESSAGE, room, text, time);
    },
  },
  data() {
    return {
      /**
      {
        text,
        name,
        id,
        time,
        type (info|chat) (type can also be "me", JUST for each client, that "me" type is NOT stored on server)
      }
       */
      messages: [
        {
          text: "this is my text",
          name: "july",
          id: 1423,
          time: new Date().toString(),
          type: "chat",
        },
        {
          text: "july is a bit overdramatic",
          name: "fred",
          id: 4893,
          time: new Date().toString(),
          type: "chat",
        },
      ],
      people: ["hey", "danny"],
      clientText: "",
    };
  },
  // establish connection with room
  beforeMount() {
    let roomName = location.pathname.substring(1);

    console.log("connect!");

    // cookies are already set
    let password = getCookie("password");
    let name = getCookie("name");
    this.$socket.emit(socket_routes.NEW_USER, roomName, name, password);
  },
  // EACH socket function takes in an array: DATA, this holds the parameters in array form
  sockets: {
    connect() {},
    [socket_routes.ERROR]: (err) => {
      // catch all error handling FOR NOW.
      alert(err);
    },
    [socket_routes.CHAT_MESSAGE](data) {
      let text = data[0];
      let name = data[1];
      let time = data[2];

      console.log(text);

      // properties
      let timeAMPM = formatAMPM(new Date(time)); // converts to current time in the function
      let id = this.messages.length + 1; // NOT sent to server

      // add my text to the chat on current page
      this.messages.push({
        text,
        name,
        id,
        time: timeAMPM,
        type: message_types.CHAT, // simply for clinet
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  max-width: 700px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  border: 1px solid #eee;
  padding: 15px;
  margin-right: auto;
  margin-left: auto;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}
.users {
  border-right: 1px solid #eee;
  float: left;
  width: 140px;
}
.users h4 {
  margin: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 3px;
  margin-bottom: 5px;
}

.users ul {
  height: 500px;
  overflow-y: scroll;
  margin: 0;
}

.list-unstyled {
  padding-left: 0;
  list-style: none;
}
.chat {
  width: 528px;
  float: left;
  padding-left: 15px;
  position: relative;
  height: auto;
}

.chat .input {
  position: absolute;
  bottom: 0;
}
.input-group {
  position: relative;
  display: table;
  border-collapse: separate;
}
.input-group-btn {
  position: relative;
  font-size: 0;
  white-space: nowrap;
}
.input-group-addon,
.input-group-btn {
  width: 1%;
  white-space: nowrap;
  vertical-align: middle;
}
.input-group .form-control,
.input-group-addon,
.input-group-btn {
  display: table-cell;
}
.input-group-btn:last-child > .btn,
.input-group-btn:last-child > .btn-group {
  z-index: 2;
  margin-left: -1px;
}

.loadmessages {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-default {
  color: #333;
  background-color: #fff;
  border-color: #ccc;
}
.btn {
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-image: none;
  border-radius: 0;
}

.chat .messages ul li .name {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
}

.chat .messages ul li span {
  border-radius: 5px !important;
  background: #e0edff;
  padding: 5px 12px;
  font-size: 15px;
}

.chat .messages ul li.me {
  text-align: right;
  margin-right: 10px;
}

.chat .messages ul li {
  margin-bottom: 10px;
}

.chat .messages ul {
  padding-bottom: 40px;
  height: 500px;
  margin: 0;
  overflow-y: scroll;
  padding-top: 5px;
}

.list-unstyled {
  padding-left: 0;
  list-style: none;
}
</style>
