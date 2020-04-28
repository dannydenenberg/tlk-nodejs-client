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
            <li class="loadmessages" v-if="loadMessagesButtonShow">
              <b-button variant="secondary" v-on:click="loadMessages"
                >Load Messages</b-button
              >
            </li>
            <!-- Check for the message from me (will be added only from client side) -->
            <li
              v-for="message in messages"
              :key="message.id"
              class="clearfix"
              :class="message.type == 'chat' ? '' : message.type"
            >
              <div v-if="message.type != message_types.INFO">
                <div class="name">
                  {{ message.name }}

                  <span class="checkmarks">
                    {{
                      message.type == "me"
                        ? checkMarks(message.numberOfCheckMarks)
                        : ""
                    }}
                  </span>
                </div>
                <span id="text">{{ message.text }}</span>
              </div>
              <div v-if="message.type == message_types.INFO">
                <b-alert show variant="info">{{ message.text }}</b-alert>
              </div>
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
import { getCookie, formatAMPM, generateTextId } from "./../crypto";
import {
  socket_routes,
  message_types,
  // message_types
} from "./../socketNames";

export default {
  // MUST by regular functions, NOT arrow functions.
  methods: {
    loadMessages() {
      console.log(`Chat History:`);
      console.log(this.messages);

      for (let i = this.chatHistory.length - 1; i >= 0; i--) {
        let chat = this.chatHistory[i];
        this.messages.unshift(chat);
      }

      this.loadMessagesButtonShow = false;

      // client has read the OLD messages
      this.$socket.emit(socket_routes.MESSAGE_READ, getCookie("room"));
    },
    // client sends message.
    sendMessage(e) {
      e.preventDefault(); // prevent page reload

      // properties
      let text = this.clientText;
      let time = new Date().toString();
      let name = getCookie("name");
      let room = getCookie("room");
      let id = generateTextId(); // NOT sent to server

      // add my text to the chat on current page
      this.messages.push({
        text,
        name,
        id,
        time,
        numberOfCheckMarks: 0,
        type: "me", // simply for clinet
      });

      // reset input
      this.clientText = "";

      //  to store in the database
      let message = {
        text,
        time,
        name,
        type: "chat",
        id,
      };

      // emit to server
      this.$socket.emit(socket_routes.CHAT_MESSAGE, room, message);
    },
    /**
     * Generate n numbers of checkmarks.
     */ checkMarks(n) {
      return "✓".repeat(n);
    },
  },
  computed: {},
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
        // {
        //   text: "this is my text",
        //   name: "july",
        //   id: 1423,
        //   time: new Date().toString(),
        //   type: "chat",
        // },
        // {
        //   text: "july is a bit overdramatic",
        //   name: "fred",
        //   id: 4893,
        //   time: new Date().toString(),
        //   type: "chat",
        // },
      ],
      chatHistory: [],
      people: [
        // "julie", "danny"
      ],
      clientText: "",
      loadMessagesButtonShow: true,
      message_types,
      windowFocused: true,
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

    // when user opens tab (goes back to the web page)
    // Emit a READ message out.
    window.addEventListener("focus", () => {
      console.log("Focus. 🎉");
      this.windowFocused = true;
      this.$socket.emit(socket_routes.MESSAGE_READ, roomName);
    });

    window.addEventListener("blur", () => {
      console.log("Focus. 🎉");
      this.windowFocused = false;
      this.$socket.emit(socket_routes.MESSAGE_READ, roomName);
    });
  },
  // EACH socket function takes in an array: DATA, this holds the parameters in array form
  // if there are more than one parameter being sent by server, data is an array of those parameters
  sockets: {
    connect() {},
    [socket_routes.ERROR]: (err) => {
      // catch all error handling FOR NOW.
      alert(err);
    },
    [socket_routes.CHAT_HISTORY](data) {
      let names = data[1];
      names.forEach((name) => {
        this.people.push(name);
      });

      console.log(`Recieved Chat History`);
      console.log(data);

      let messages = data[0];
      console.log(messages);
      this.chatHistory = messages;
    },
    [socket_routes.MESSAGE_READ]() {
      // second of the check notifications.
      // any message with 1 checks go to 2.
      for (let message of this.messages) {
        if (message.type == "me") {
          if (message.numberOfCheckMarks == 1) {
            message.numberOfCheckMarks = 2;
          }
        }
      }
    },
    [socket_routes.MESSAGE_SENT]() {
      // first of the check notifications.
      // any message with 0 checks go to 1.
      for (let message of this.messages) {
        if (message.type == "me") {
          if (message.numberOfCheckMarks == 0) {
            message.numberOfCheckMarks = 1;
          }
        }
      }
    },
    [socket_routes.PERSON_JOIN](name) {
      // person joined chat, add him to list of users
      this.people.push(name);
    },
    [socket_routes.USER_DISCONNECT](name) {
      // person left, remove him from list of users
      this.people = this.people.filter((person) => person != name);
    },
    [socket_routes.CHAT_MESSAGE](data) {
      // if the user is on the window, tell everyone
      if (this.windowFocused) {
        this.$socket.emit(socket_routes.MESSAGE_READ, getCookie("room"));
      }

      console.log(`Recieved Chat Message`);
      console.log(data);

      let message = data;
      console.log(message.text);

      // properties
      message.time = formatAMPM(new Date(message.time)); // converts to current time in the function

      // add my text to the chat on current page
      this.messages.push(message);
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
  padding-bottom: 28px;
}

.chat .input {
  position: absolute;
  // bottom: 0;
  margin-top: 20px;
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

.checkmarks {
  color: green;
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

.chat .messages ul li #text {
  border-radius: 5px !important;
  background: #e0edff;
  padding: 5px 12px;
  font-size: 15px;
}

.chat .messages ul li.info {
  text-align: center;
  padding-top: 20px;
  padding-bottom: 10px;
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
