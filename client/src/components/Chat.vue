<template>
  <div :style="{ background: backgroundColor }">
    <beautiful-chat v-if="messageHistoryReady && participantsReady"
      :alwaysScrollToBottom="alwaysScrollToBottom"
      :close="closeChat"
      :colors="colors"
      :isOpen="isChatOpen"
      :messageList="messageList"
      :messageStyling="messageStyling"
      :newMessagesCount="newMessagesCount"
      :onMessageWasSent="onMessageWasSent"
      :open="openChat"
      :participants="participants"
      :showCloseButton="true"
      :showLauncher="true"
      :showEmoji="false"
      :showFile="false"
      :showTypingIndicator="showTypingIndicator"
      :showEdition="false"
      :showDeletion="false"
      @scrollToTop="handleScrollToTop"
      @onType="handleOnType"
    >
      <template v-slot:text-message-body="scopedProps"> 
        <p class="p-0 m-0" style="color: #2e57ff;" v-if="scopedProps.message.author != 'me'">{{ scopedProps.message.author }}:</p>
        <p class="sc-message--text-content p-1 m-0" style="float: left;" v-html="scopedProps.messageText"></p>
        <p v-if="scopedProps.message.data.meta" class='sc-message--meta' :style="{ color: scopedProps.messageColors.color }">{{ scopedProps.message.data.meta }}</p>
      </template>
      <template v-slot:system-message-body="{ message }">
        [System]: {{ message.text }}
      </template>
    </beautiful-chat>
  </div>
</template>

<script>
import availableColors from '../assets/colors'
import { messaging } from '../../firebase'

export default {
  data() {
    return {
      module: {},
      participants: [],
      participantsReady: false,
      messageList: [],
      messageHistoryReady: false,
      newMessagesCount: 0,
      isChatOpen: false,
      showTypingIndicator: '',
      colors: null,
      availableColors,
      chosenColor: null,
      alwaysScrollToBottom: true,
      messageStyling: true,
      userIsTyping: false,
      msgCount: 0
    }
  },
  props: {
    moduleDevelopers: {
      type: Object
    }
  },
  methods: {
    init() {
      this.module = JSON.parse(localStorage.getItem('module'));
      this.setColor('blue');
      this.participantsReady = false;
      var moduleDevelopers = localStorage.getItem('developers').split(",");

      var i = 0;
      var chatPartecipants = [];
      moduleDevelopers.forEach(el => {
        var m = {}
        
        m.id = el;
        m.name = el;
        m.imageUrl = '';
        
        chatPartecipants[i] = m;
        i++;
      });
      this.participants = chatPartecipants;
      this.participantsReady = true;
    },
    onMessageWasSent(message) {
      if (message.data.text.length > 0) {
        this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + 1;
        this.username = JSON.parse(localStorage.getItem('user')).email;
        var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
        var json = {
          "message": message.data.text
        }

        this.$http.post(localStorage.getItem('path') + '/projects/' + this.module.project + '/modules/' + this.module.name + '/messages', json, tokenJson).then(function() {
          this.messageList = [...this.messageList, Object.assign({}, message, { id: Math.random() })]
        }, (err) => {
          console.log(err.body);
        });
      }
    },
    openChat() {
      this.isChatOpen = true;
      this.newMessagesCount = 0;
    },
    closeChat() {
      this.isChatOpen = false;
    },
    setColor(color) {
      this.colors = this.availableColors[color];
      this.chosenColor = color;
    },
    handleOnType() {
      this.$root.$emit('onType');
      this.userIsTyping = true;
    },
    loadMessages() {
      this.messageHistoryReady = false;
      this.msgCount = 0;
      this.username = JSON.parse(localStorage.getItem('user')).email;
      var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
      
      this.$http.get(localStorage.getItem('path') + '/projects/' + this.module.project + '/modules/' + this.module.name + '/messages', tokenJson).then(function(response) {
        var res = response.body;
        var i = 0;
        var messagesFormatted = [];

        res.forEach(el => {
          var m = {}
          if (el.sender == this.username) {
            m.author = "me";
          } else {
            m.author = el.sender;
          }
          m.data = {
            text: el.message
          }
          m.id = i;
          m.type = "text";
          messagesFormatted[i] = m;
          i++;
        });

        this.messageList = messagesFormatted.reverse();
        this.msgCount = res.length;
        this.messageHistoryReady = true;
      }, (err) => {
        console.log(err.body);
      });
    },
    handleScrollToTop() {
      if (this.msgCount % 100 == 0) {
        var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
        
        this.$http.get(localStorage.getItem('path') + '/projects/' + this.module.project + '/modules/' + this.module.name + '/messages/' + this.msgCount, tokenJson).then(function(response) {
          var res = response.body;
          var i = 0;
          var messagesFormatted = [];

          res.forEach(el => {
            var m = {}
            if (el.sender == this.username) {
              m.author = "me";
            } else {
              m.author = el.sender;
            }
            m.data = {
              text: el.message
            }
            m.id = i;
            m.type = "text";
            messagesFormatted[i] = m;
            i++;
          });

          this.messageList = messagesFormatted.reverse().concat(this.messageList);
          this.msgCount += res.length;
          this.messageHistoryReady = true;
        }, (err) => {
          console.log(err.body);
        });
      }
    }
  },
  computed: {
    backgroundColor() {
      return this.chosenColor === 'dark' ? this.colors.messageList.bg : '#fff';
    }
  },
  created() {
    this.init();

    messaging.onMessage(payload => {
      var notifications = localStorage.getItem('notifications');
      switch (payload.data.topic) {
          case "chat_message":
              var username = JSON.parse(localStorage.getItem('user')).email;
              if (payload.data.senderEmail != username) {
                this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + 1;
                this.messageList.push({"author": payload.data.senderEmail, "data": { "text": payload.data.message }, "id": Math.random(), "type": "text"});
                notifications++;
                localStorage.removeItem('notifications');
                localStorage.setItem('notifications', notifications);
              }
              break;
          case "developer_added":
              notifications++;
              localStorage.removeItem('notifications');
              localStorage.setItem('notifications', notifications);
              break;
          case "task_completed":
              notifications++;
              localStorage.removeItem('notifications');
              localStorage.setItem('notifications', notifications);
              break;
      }
      this.$emit('notificationsNumber', notifications);
    });
  },
  mounted(){
    this.loadMessages();
  }
}
</script>

<style>
body {
  padding: 0px;
  margin: 0px;
}

* {
  font-family: Avenir Next, Helvetica Neue, Helvetica, sans-serif;
}

.demo-description {
  max-width: 500px;
}

.demo-description img {
  max-width: 500px;
}

.demo-test-area {
  width: 300px;
  box-sizing: border-box;
}

.demo-test-area--text {
  box-sizing: border-box;
  width: 100%;
  margin: 0px;
  padding: 0px;
  resize: none;
  font-family: Avenir Next, Helvetica Neue, Helvetica, sans-serif;
  background: #fafbfc;
  color: #8da2b5;
  border: 1px solid #dde5ed;
  font-size: 16px;
  padding: 16px 15px 14px;
  margin: 0;
  border-radius: 6px;
  outline: none;
  height: 150px;
  margin-bottom: 10px;
}

.demo-monster-img {
  width: 400px;
  display: block;
  margin: 60px auto;
}

.text-center {
  text-align: center;
}

.colors a {
  color: #fff;
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 10px;
}

.toggle a {
  text-decoration: none;
}

.messageStyling {
  font-size: small;
}

.sc-chat-window {
  z-index: 2;
}

.sc-header--title.enabled{
  font-size: 16px;
}
</style>
