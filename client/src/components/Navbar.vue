<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light rounded">
        <a class="col-6 col-sm-6 col-md-6 col-xl-6 navbar-brand text-left mx-0 p-1" href="#">RutWorking</a>
        <!-- collapse w-100 order-3 dual-collapse2 -->

        <div >
            <b-dropdown class="d-sm-none d-none d-sm-block d-md-block d-lg-block float-right" right variant="light">
                <template v-slot:button-content>
                    <div @click="getNotificationsList">
                        <font-awesome-icon icon="user"/> {{ notificationsNumber }}
                    </div>
                    
                </template>
                <div v-if="notificationsReady">
                    <b-dropdown-item v-for="(n, index) in notificationsList" :key="index"> {{ n.topic }} {{ n.projectName }} {{ n.moduleName }} {{ n.projectName }} {{ n.senderEmail }} {{ n.message }} </b-dropdown-item>
                </div>
                <div v-else>
                    <font-awesome-icon icon="user" spin size="4x"/> <!-- rotella -->
                </div>
            </b-dropdown>
        </div>

        <div class="col-6 col-sm-6 col-md-6 col-xl-6 mx-0 p-0">
            <b-dropdown class="d-none d-sm-block d-md-block d-lg-block float-right" right variant="light">
                <template v-slot:button-content>
                    {{ username }} 
                </template>
                <b-dropdown-item v-if="firstDropdownItem == 'personal-area'" @click="openPersonalArea"><font-awesome-icon icon="user"/> Personal area</b-dropdown-item>
                <b-dropdown-item v-if="firstDropdownItem == 'home-page'" @click="openHomePage"><font-awesome-icon icon="home"/> Home page</b-dropdown-item>
                <b-dropdown-item @click="logout"><font-awesome-icon icon="sign-out-alt"/> Logout</b-dropdown-item>
            </b-dropdown>

            <b-dropdown class="d-sm-none float-right" right variant="light">
                <template v-slot:button-content>
                    <font-awesome-icon icon="bars" size="lg"/>
                </template>
                <b-dropdown-header disabled> {{ username }} </b-dropdown-header>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item @click="openPersonalArea"><font-awesome-icon icon="user"/> Personal area</b-dropdown-item>
                <b-dropdown-item @click="logout"><font-awesome-icon icon="sign-out-alt"/> Logout</b-dropdown-item>
            </b-dropdown>

        </div>
    </nav>
</template>

<script>

export default {
    data () {
        return {
            username: '',
            notificationsList: [],
            notificationsNumber: 0,
            notificationsReady: false
        }
    },
    created () {
        this.init();
    },
    props: {
        firstDropdownItem: {
            type: String
        }
    },
    methods: {
        showUserName () {
            this.username = JSON.parse(localStorage.getItem('user')).email;
        },
        logout() {
            this.$router.push('/login');
        },
        init () {
            //this.getNotificationsNumber();
            this.showUserName();
        },
        openPersonalArea () {
            this.$router.push('/personalarea');
        },
        openHomePage() {
            this.$router.push('/');
        },
        getNotificationsNumber() {
            
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            //TODO
            this.$http.get(localStorage.getItem('path') + '/notifications/unseen/count', tokenJson).then(function(response) {
                console.log(response.body);
                localStorage.setItem('notifications', response.body);
                this.notificationsNumber = response.body;

                
            }, (err) => {
                console.log(err.body);
            });
        },
        getNotificationsList() {
            alert("CIAO");
            /*
            this.notificationsReady = false;
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.get(localStorage.getItem('path') + '/notifications', tokenJson).then(function(response) {
                console.log(response.body);
                this.notificationsList = response.body;
                this.notificationsReady = true;
                
            }, (err) => {
                console.log(err.body);
            });
            */

        }
    }
};
</script>

<style scoped>
.default-msg {
    padding: 20% 0%;
}

.b-dropdown:hover {
    background-color: #F8F9FA;
}
 
/*
@media (max-width: 576px) {
    .detail {
      padding: 0px !important;
      margin: 0px !important;
    }
}
*/

</style>