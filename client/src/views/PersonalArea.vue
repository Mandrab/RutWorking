<template>
    <div class="container-fluid">
        <navbar :firstDropdownItem="firstDropdownItem"></navbar>

        <div class="row mt-5 col-12 col-sm-12 col-md-12 col-lg-6 offset-lg-3">
            <div class="col-12 col-sm-12 col-md-12 col-lg-12 bg-light rounded p-5 mx-3 mb-5">
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
                <div class="text-center p-2">
                    <button @click.prevent="changePassword" class="btn btn-primary">Change password</button>
                </div>
            </div>
        </div>
        
        <div class="row mb-5 col-12 col-sm-12 col-md-12 col-lg-6 offset-lg-3">
            <div class="col-12 col-sm-12 col-md-12 col-lg-12 bg-light rounded mx-3 mb-5 pb-3">
                <div class="row">
                    <div class="col-12 col-sm-12 col-md-12 col-xl-12 justify-content-center px-5 pt-3 pb-0">
                        <h2>Contest</h2>
                    </div>
                </div>
                <div v-if="scoreReady && role == 'admin'" class="row">
                    <div class="col-12 col-sm-12 col-md-12 col-xl-12 justify-content-center px-3 pt-0 pb-3">
                        <button @click.prevent="resetRanking" class="btn btn-primary">Reset</button>
                    </div>
                    <div class="col-md-12 m-0 p-0" v-for="(score, index) in scores" :key="index">
                        <div v-if="indexInScoreArray != index" class="row scoreTile m-1 p-0">
                            <div class="col-sm-6 text-left"> {{ index+1 }})  {{ score.email }} </div>
                            <div class="col-sm-6 text-right">Score: {{ score.score }} </div>
                        </div>
                    </div>
                    <infinite-loading v-if="moreRankings" @infinite="showMoreRankings($event)"></infinite-loading>
                </div>
                <div v-else>
                    <div v-if="scoreReady" class="row">
                        <div class="col-md-12 m-0 p-0" v-for="(score, index) in firstTenScores" :key="index">
                            <div v-if="indexInScoreArray == index && role != 'admin'" class="row scoreTile m-1 p-0">
                                <div class="col-sm-6 text-left text-primary"> <b> {{ index + 1 }}) ME </b> </div>
                                <div class="col-sm-6 text-right">Score: {{ score.score }} </div>
                            </div>
                            <div v-if="indexInScoreArray != index" class=" row scoreTile m-1 p-0">
                                <div class="col-sm-6 text-left"> {{ index+1 }})  {{ score.email }} </div>
                                <div class="col-sm-6 text-right">Score: {{ score.score }} </div>
                            </div>
                        </div>
                        <div class="col-md-12 m-0 p-0" v-if="indexInScoreArray > 10 && ranked && role != 'admin'">
                            <div class=" row scoreTile m-1 p-0">
                                <div class="col-sm-6 text-left text-primary"> <b> {{ indexInScoreArray + 1 }}) ME </b> </div>
                                <div class="col-sm-6  text-right">Score: {{ scores[indexInScoreArray].score }} </div>
                            </div>
                        </div>
                        <div class="col-md-12 m-0 p-0" v-if="indexInScoreArray > 10 && !ranked && role != 'admin'">
                            <div class=" row scoreTile m-1 p-0">
                                <div class="col-sm-6 text-left text-primary"> <b> ME </b> </div>
                                <div class="col-sm-6 text-right">Score: {{ scores[indexInScoreArray].score }} </div>
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <font-awesome-icon style="color: gray;" icon="spinner" size="2x" pulse/>
                    </div>
                </div>
            </div>
        </div>

        <changePasswordFormModal v-if="this.showModalPasswordChange" @closeModal="closeModalPassword"></changePasswordFormModal>
    
        <simpleModal v-if="showModal" :title="title" :message="message" @closeModal="closeModal"></simpleModal>
    </div>
</template>

<script src="https://unpkg.com/vue-infinite-loading@^2/dist/vue-infinite-loading.js"></script>

<script>
import navbar from '../components/Navbar.vue'
import changePasswordFormModal from '../components/ChangePasswordFormModal.vue'
import simpleModal from '../components/SimpleModal.vue'
import infiniteLoading from 'vue-infinite-loading'

export default {
    data() {
        return {
            name: '',
            surname: '',
            username: '',
            role: '',
            firstDropdownItem: 'home-page',
            showModalPasswordChange: false,
            indexInScoreArray: null,
            scores: [],
            firstTenScores:[],
            scoreReady: false,
            showModal: false,
            title: 'Users ranking',
            message: '',
            moreRankings: false,
            skipN: 100,
            ranked: false
        }
    },
    components: {
        navbar,
        changePasswordFormModal,
        simpleModal,
        infiniteLoading
    },
    methods: {
        init() {
            this.username = JSON.parse(localStorage.getItem('user')).email;
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            
            this.$http.get(localStorage.getItem('path') + '/user/' + this.username, tokenJson).then(function(response) {
                var res = response.body;
                this.name = res.name;
                this.surname = res.surname;
                this.role = res.role;
            }, (err) => {
                console.log(err.body);
            });
            this.getContestRanking();
        },
        getContestRanking() {
            this.scoreReady = false;
            this.ranked = false;
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            
            this.$http.get(localStorage.getItem('path') + '/contest/ranking', tokenJson).then(function(response) {
                var res = response.body;
                this.scores = res;
                if (this.role == 'admin') {
                    for (var i = 0; i < res.length; i++) {
                        if(res[i].email == this.username){
                            this.scores.splice(i, 1);
                            break;
                        }
                    }
                }
                if (this.scores.length >= 100) {
                    this.moreRankings = true;
                } else {
                    this.moreRankings = false; 
                }
                this.firstTenScores = res.slice(0, 10)
                if (res.length > 0) {
                    for (var i = 0; i < res.length; i++) {
                        if (res[i].email == this.username) {
                            this.indexInScoreArray = i;
                            if (i < res.length - 1) {
                                this.ranked = true;
                            } else {
                                this.ranked = false;
                            }
                        }
                    }
                }
                this.scoreReady = true;
            }, (err) => {
                console.log(err.body);
            });
        },
        showMoreRankings($state) {
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            
            this.$http.get(localStorage.getItem('path') + '/contest/ranking/' + this.skipN, tokenJson).then(function(response) {
                var res = response.body;
                this.scores = this.scores.concat(res);
                if (this.role == 'admin') {
                    for (var i = 0; i < this.scores.length; i++) {
                        if (this.scores[i].email == this.username) {
                            this.scores.splice(i, 1);
                            break;
                        }
                    }
                }
                $state.loaded();
                if (res.legnth >= 100) {
                    this.moreRankings = true;
                } else {
                    this.moreRankings = false; 
                    $state.complete();
                }
                this.skipN += 100;
            }, (err) => {
                console.log(err.body);
            });
        },
        changePassword() {
            this.showModalPasswordChange = true;
        },
        closeModalPassword() {
            this.showModalPasswordChange = false;
        },
        resetRanking() {
            var tokenjson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.put(localStorage.getItem('path') + '/contest/reset', {}, tokenjson).then(function() {
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
        openHomePage() {
            if (this.role == "user") {
                this.$router.push('/');
            } else {
                this.$router.push('/adminpage');
            }
        },
        logout() {
            this.$router.push('/login');
        }
    },
    created () {
        this.init();
    }
};
</script>

<style scoped>
.scoreTile{
    border-radius:  0.25rem;
    background-color: #DDDDDD;
}
</style>