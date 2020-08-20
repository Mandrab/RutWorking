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
                <b-dropdown-item @click="openHomePage">Home Page</b-dropdown-item>
                <b-dropdown-item @click="logout">Logout</b-dropdown-item>
            </b-dropdown>

            <b-dropdown class="d-sm-none float-right" id="dropdown-options" right variant="light">
                <template v-slot:button-content>
                    ...
                </template>
                <b-dropdown-header disabled> {{ username }} </b-dropdown-header>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item @click="openHomePage">Home Page</b-dropdown-item>
                
                <b-dropdown-item @click="logout">Logout</b-dropdown-item>
            </b-dropdown>
        </div>
    </nav>

        <div class="row mt-5">
            <div class="col-sm bg-light rounded p-5 mx-5 mb-5">
                <h2>User Info</h2>
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
                <h2>Access Management</h2>
                <button @click.prevent="changePassword" class="btn btn-primary">Change password</button>
            </div>
        </div>
    
        <div class="row mt-5">
            <div class="col-sm-6 offset-sm-3 bg-light rounded">
                <h2>Statistics</h2>
            </div>
        </div>

        <div class="row mt-5">
            <div class="col-sm-6 offset-sm-3 bg-light rounded">
                <h2>Gamification</h2>
            </div>
        </div>
        <changePwdModal v-if="this.showModalPasswordChange" @closeModal="closeModalPwd"></changePwdModal>
    </div>
</template>


<script>
import changePwdModal from '../components/ChangePwdModal.vue';

export default {
    data () {
        return {
            name: '',
            surname: '',
            username: '',
            role: '',
            showDropdownMenu: false,
            showModalPasswordChange: false
        }
    },
    components: {
        changePwdModal
    },
    created () {
        this.init();
    },
    methods: {
        init () {
            this.username = JSON.parse(localStorage.getItem('user')).email;

            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            this.$http.get(localStorage.getItem('path') + '/user/' + this.username/*, json*/, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire try catch in futuro
                    res = JSON.parse(res);
                } catch (error) {
                    console.log(error);
                }
                this.name = res.name;
                this.surname = res.surname;
                this.role = res.role;
            }, (err) => {
                alert(err);
                console.log(err.body);
                //mostrare errore nel componente contenitore dei tile magari con una scritta rossa
            });
            
        },
        changePassword () {
            this.showModalPasswordChange = true;
        },
        closeModalPwd () {
            this.showModalPasswordChange = false;
        },
        openHomePage () {
            this.$router.push('/');
        },
        logout () {
            this.$router.push('/login');
        }
    }
};
</script>