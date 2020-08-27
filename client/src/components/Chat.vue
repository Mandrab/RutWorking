<template>
  <div :style="{background: backgroundColor}">
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
      @onType="handleOnType"
      @edit="editMessage"
      @remove="removeMessage"
    >
      <!--<template v-slot:text-message-toolbox="scopedProps">
        <button v-if="!scopedProps.me && scopedProps.message.type==='text'" @click.prevent="like(scopedProps.message.id)">
          👍
        </button>
      </template>-->
      <template v-slot:text-message-body="scopedProps"> 
        <p class="p-0 m-0" style="color: #2e57ff;" v-if="scopedProps.message.author != 'me'">{{scopedProps.message.author}}:</p>
        
        <p class="sc-message--text-content p-1 m-0" style="float: left;" v-html="scopedProps.messageText"></p>
        <p v-if="scopedProps.message.data.meta" class='sc-message--meta' :style="{color: scopedProps.messageColors.color}">{{scopedProps.message.data.meta}}</p>
        <!--<p v-if="scopedProps.message.isEdited || scopedProps.message.liked" class='sc-message--edited'>
          <template v-if="scopedProps.message.isEdited">✎</template>
          <template v-if="scopedProps.message.liked">👍</template>
        </p>-->
      </template>
      <template v-slot:system-message-body="{ message }">
        [System]: {{message.text}}
      </template>
    </beautiful-chat>
  </div>
</template>

<script>

import availableColors from './colors'
import { messaging } from '../../firebase'

export default {
  components: {
  },
  props: {
    moduleDevelopers: {
      type: Object
    }
  },
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
      userIsTyping: false
    }
  },
  created() {
    this.init();
    messaging.onMessage(payload => {
      console.log("MESSAGE PAYLOAD: ")
      console.log(payload)
      alert(payload.data.sender, payload.data.message)
    });
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
    handleTyping(text) {
      this.showTypingIndicator = text.length > 0 ? this.participants[this.participants.length - 1].id : ''
    },
    onMessageWasSent(message) {
      if (message.data.text.length > 0) {
        this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + 1

        this.username = JSON.parse(localStorage.getItem('user')).email;
        var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
        console.log("TOKEN");
        console.log(tokenJson);
        var json = {
            "message": message.data.text
        }
        this.$http.post(localStorage.getItem('path') + '/projects/' + this.module.project + '/modules/' + this.module.name + '/messages', json, tokenJson).then(function(response) {
            console.log(response.body);
            var res = response.body;
            try {//è un livello di sicurezza in più, potrebbe non servire try catch in futuro
                res = JSON.parse(res);
            } catch (error) {
                console.log(error);
            }
            console.log("SEND MSG");
            console.log(res);

            this.messageList = [...this.messageList, Object.assign({}, message, {id: Math.random()})]
        }, (err) => {
            alert(err);
            console.log(err.body);
            //mostrare errore nel componente contenitore dei tile magari con una scritta rossa
        });
      }
    },
    openChat() {
      this.isChatOpen = true
      this.newMessagesCount = 0
    },
    closeChat() {
      this.isChatOpen = false
    },
    setColor(color) {
      this.colors = this.availableColors[color]
      this.chosenColor = color
    },
    showStylingInfo() {
      this.$modal.show('dialog', {
        title: 'Info',
        text:
          'You can use *word* to <strong>boldify</strong>, /word/ to <em>emphasize</em>, _word_ to <u>underline</u>, `code` to <code>write = code;</code>, ~this~ to <del>delete</del> and ^sup^ or ¡sub¡ to write <sup>sup</sup> and <sub>sub</sub>'
      })
    },
    messageStylingToggled(e) {
      this.messageStyling = e.target.checked
    },
    handleOnType() {
      this.$root.$emit('onType')
      this.userIsTyping = true
    },
    editMessage(message){
      const m = this.messageList.find(m => m.id === message.id);
      m.isEdited = true;
      m.data.text = message.data.text;
    },
    removeMessage(message){
      if (confirm('Delete?')){
        const m = this.messageList.find(m => m.id === message.id);
        m.type = 'system';
        m.data.text = 'This message has been removed';
      }
    },
    /*like(id){
      const m = this.messageList.findIndex(m => m.id === id);
      var msg = this.messageList[m];
      msg.liked = !msg.liked;
      this.$set(this.messageList, m, msg);
    },*/
    loadMessages() {
        this.messageHistoryReady = false;
        this.username = JSON.parse(localStorage.getItem('user')).email;

        var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
        this.$http.get(localStorage.getItem('path') + '/projects/' + this.module.project + '/modules/' + this.module.name + '/messages', tokenJson).then(function(response) {
            console.log(response.body);
            var res = response.body;
            try {//è un livello di sicurezza in più, potrebbe non servire try catch in futuro
                res = JSON.parse(res);
            } catch (error) {
                console.log(error);
            }
            


            var i = 0;
            var messagesFormatted = [];

            res.forEach(el => {
              var m = {}
              if(el.sender == this.username){
                m.author = "me";
              }else {
                m.author = el.sender;
              }
              m.data = {
                text: el.message
              }
              m.id = i;
              m.type = "text";
              // dovrebbe essere nel formato giusto adesso
              console.log("___:::::::::_________:::::::_____")
              console.log(m);
              messagesFormatted[i] = m;
              i++;
            });



            this.messageList = messagesFormatted;
            //this.messageList = res;
            console.log("MESSAGE LIST");
            console.log(this.messageList);

            this.messageHistoryReady = true;
        }, (err) => {
            alert(err);
            console.log(err.body);
            //mostrare errore nel componente contenitore dei tile magari con una scritta rossa
        });
    }
  },
  computed: {
    linkColor() {
      return this.chosenColor === 'dark'
        ? this.colors.sentMessage.text
        : this.colors.launcher.bg
    },
    backgroundColor() {
      return this.chosenColor === 'dark' ? this.colors.messageList.bg : '#fff'
    }
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
