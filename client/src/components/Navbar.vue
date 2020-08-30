<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light rounded">
        <a class="col-6 col-xs-6 col-sm-6 col-md-6 col-xl-6 navbar-brand text-left mx-0 p-1" href="#">RutWorking</a>

        <div class="col-6 col-xs-6 col-sm-6 col-md-6 col-xl-6 mx-0 p-0">
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

            <b-dropdown class="d-block d-sm-block d-md-block d-lg-block float-right" style="z-index:2; padding" right variant="light">
                <template v-slot:button-content>
                    <span @click="getNotificationsList">
                        <font-awesome-icon icon="bell" size="lg"/><div v-if="notificationsNumber != 0" style=" border-radius: 10px; background-color: #f33d3d; position: absolute; top: 18px; right: 17px; height: 15px; width: 15px; padding: 0px; margin: 0px; font-size: 10px;">{{notificationsNumber}}</div><!--{{notificationsNumber}}--></span>
                </template>
                <div v-if="notificationsReady">
                    <b-dropdown-item v-for="(n, index) in notificationsList" :key="index"> {{ n.topic }} {{ n.projectName }} {{ n.moduleName }} {{ n.projectName }} {{ n.senderEmail }} {{ n.message }} </b-dropdown-item>
                </div>
                <div v-else>
                    <font-awesome-icon icon="spinner" spin size="2x"/>
                </div>
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
        init() {
            this.showUserName();
            this.getNotificationsNumber();
        },
        showUserName() {
            this.username = JSON.parse(localStorage.getItem('user')).email;
        },
        getNotificationsNumber() {
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.get(localStorage.getItem('path') + '/notifications/unseen/count', tokenJson).then(function(response) {
                var res = response.body.unseenNotifications;
                this.notificationsNumber = res;
                localStorage.setItem('notifications', res);
            }, (err) => {
                console.log(err.body);
            });
        },
        getNotificationsList() {
            this.notificationsReady = false;
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.get(localStorage.getItem('path') + '/notifications', tokenJson).then(function(response) {
                console.log(response.body);
                this.notificationsList = response.body;
                this.notificationsReady = true;
            }, (err) => {
                console.log(err.body);
            });
        },
        openPersonalArea() {
            this.$router.push('/personalarea');
        },
        openHomePage() {
            if (localStorage.getItem('role') == 'user') {
                this.$router.push('/');
            } else {
                this.$router.push('/adminpage');
            }
        },
        logout() {
            this.$router.push('/login');
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