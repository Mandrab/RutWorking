<template>
    <div class="container-fluid">
        <nav class="navbar navbar-expand-lg navbar-light bg-light rounded">
            <a class="col-6 col-sm-6 col-md-6 col-xl-6 navbar-brand text-left mx-0 p-1" href="#" @click="openHomePage">RutWorking</a>
            <!-- collapse w-100 order-3 dual-collapse2 -->
            <div class="col-6 col-sm-6 col-md-6 col-xl-6 mx-0 p-0">
                <b-dropdown class="d-none d-sm-block d-md-block d-lg-block float-right" id="dropdown-options" right variant="light">
                    <template v-slot:button-content>
                        {{ username }}
                    </template>
                    <b-dropdown-item @click="openHomePage">Home page</b-dropdown-item>
                    <b-dropdown-item @click="logout">Logout</b-dropdown-item>
                </b-dropdown>

                <b-dropdown class="d-sm-none float-right" id="dropdown-options" right variant="light">
                    <template v-slot:button-content>
                        ...
                    </template>
                    <b-dropdown-header disabled> {{ username }} </b-dropdown-header>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item @click="openHomePage">Home page</b-dropdown-item>
                    <b-dropdown-item @click="logout">Logout</b-dropdown-item>
                </b-dropdown>
            </div>
        </nav>

        <div class="row mt-5">
            <div class="col-sm bg-light rounded p-5 mx-5 mb-5">
                <h2>User info</h2>
                <div class="text-left p-2">
                    <a> <b>Name</b>: {{ name }} </a>
                </div>
                <div class="text-left p-2">
                    <a> <b>Surname</b>: {{ surname }} </a>
                </div>
                <div class="text-left p-2">
                    <a> <b>E-mail</b>: {{ username }} </a>
                </div>
                <div class="text-left p-2">
                    <a> <b>Role</b>: {{ role }} </a>
                </div>
            </div>
            <div class="col-sm bg-light rounded p-5 mx-5 mb-5">
                <div>
                    <h2>Access management</h2>
                </div>
                <div class="mt-5">
                    <button @click.prevent="changePassword" class="btn btn-primary">Change password</button>
                </div>
            </div>
        </div>
    
        <!--
        <div class="row mt-5">
            <div class="col-sm-6 offset-sm-3 bg-light rounded">
                <h2>Statistics</h2>
            </div>
        </div>
        -->
        
        <div class="row mb-5 mx-5">
            <div class="col-12 col-sm-12 col-md-12 col-lg-6 offset-lg-3 bg-light rounded">
                <div class="row">
                    <div class="col-12 col-sm-12 col-md-12 col-xl-12 justify-content-center px-3 pt-3 pb-0">
                        <h2>Gamification</h2>
                    </div>
                </div>
                <div v-if="role == 'admin'" class="row">
                    <div class="col-12 col-sm-12 col-md-12 col-xl-12 justify-content-center px-3 pt-0 pb-3">
                        <button @click.prevent="resetRanking" class="btn btn-primary">Reset</button>
                    </div>
                </div>
                <div class="row" v-if="scoreReady">
                    <div class="col-md-12 m-0 p-0" v-for="(score, index) in scores" :key="index">
                        <div v-if="indexInScoreArray == index" class=" row scoreTile  m-1 p-0">
                            <div class="col-sm-6 text-left text-primary"> <b>{{index+1}}) ME</b> </div>
                            <div class="col-sm-6  text-right">Score: {{score.score}}</div>
                        </div>
                        <div v-else class=" row scoreTile  m-1 p-0">
                            <div class="col-sm-6 text-left">{{index+1}})  {{score.email}}</div>
                            <div class="col-sm-6  text-right">Score: {{score.score}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <changePasswordFormModal v-if="this.showModalPasswordChange" @closeModal="closeModalPwd"></changePasswordFormModal>
    
        <simpleModal v-if="showModal" :title="title" :message="message" @closeModal="closeModal"></simpleModal>
    </div>
</template>


<script>
import changePasswordFormModal from '../components/ChangePasswordFormModal.vue';
import simpleModal from '../components/SimpleModal.vue'

export default {
    data () {
        return {
            name: '',
            surname: '',
            username: '',
            role: '',
            showDropdownMenu: false,
            showModalPasswordChange: false,
            indexInScoreArray: null,
            scores: [],
            scoreReady: false,
            showModal: false,
            title: 'Users ranking',
            message: ''
        }
    },
    components: {
        changePasswordFormModal,
        simpleModal
    },
    created () {
        this.init();
    },
    methods: {
        init () {
            this.username = JSON.parse(localStorage.getItem('user')).email;

            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            this.$http.get(localStorage.getItem('path') + '/user/' + this.username, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                
                this.name = res.name;
                this.surname = res.surname;
                this.role = res.role;
            }, (err) => {
                console.log(err.body);
                //mostrare errore nel componente contenitore dei tile magari con una scritta rossa
            });

            this.getContestRanking();

        },
        getContestRanking() {
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            this.$http.get(localStorage.getItem('path') + '/contest/ranking', tokenJson).then(function(response) {
                this.scoreReady= false;
                console.log(response.body);
                var res = response.body;
                this.scores = res;
                if (res.length >0) {
                    for (var i = 0; i<res.length; i++) {
                        if (res[i].email == this.username) {
                            this.indexInScoreArray = i;
                        }
                    }
                }
                /*
                if (this.indexInScoreArray == null) {
                    alert("non in lista")
                }
                */
                this.scoreReady= true;

            }, (err) => {
                console.log(err.body);
                //mostrare errore nel componente contenitore dei tile magari con una scritta rossa
            });
        },
        changePassword() {
            this.showModalPasswordChange = true;
        },
        closeModalPwd() {
            this.showModalPasswordChange = false;
        },
        resetRanking() {
            var tokenjson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.put(localStorage.getItem('path') + '/contest/reset', {}, tokenjson).then(function(response) {
                console.log(response.body);
                this.message = 'General ranking of users successfully reset!';
                this.showModal = true;
                this.getContestRanking();
            }, (err) => {
                console.log(err.body);
            });
        },
        closeModal() {
            this.showModal = false;
        },
        openHomePage () {
            if (this.role == "user") {
                this.$router.push('/');
            } else {
                this.$router.push('/adminpage');
            }
        },
        logout () {
            this.$router.push('/login');
        }
    }
};
</script>

<style scoped>
.scoreTile{
    border-radius:  0.25rem;
    background-color: #DDDDDD;
}



</style>