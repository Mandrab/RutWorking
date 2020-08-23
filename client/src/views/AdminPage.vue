<template>
  <div class="container-fluid">
    <nav class="navbar navbar-expand-lg navbar-light bg-light rounded">
        <a class="col-6 col-sm-6 col-md-6 col-xl-6 navbar-brand text-left mx-0 p-1" href="#">RutWorking</a>
        <!-- collapse w-100 order-3 dual-collapse2 -->
        <div class="col-6 col-sm-6 col-md-6 col-xl-6 mx-0 p-0">
            <b-dropdown class="d-none d-sm-block d-md-block d-lg-block float-right" id="dropdown-options" right variant="light">
                <template v-slot:button-content>
                    {{ username }}
                </template>
                <b-dropdown-item @click="openPersonalArea">Personal area</b-dropdown-item>
                <b-dropdown-item @click="logout">Logout</b-dropdown-item>
            </b-dropdown>

            <b-dropdown class="d-sm-none float-right" id="dropdown-options" right variant="light">
                <template v-slot:button-content>
                    ...
                </template>
                <b-dropdown-header disabled> {{ username }} </b-dropdown-header>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item @click="openPersonalArea">Personal area</b-dropdown-item>
                <b-dropdown-item @click="logout">Logout</b-dropdown-item>
            </b-dropdown>
        </div>
    </nav>
    <div class="row mt-5">
        <div class="col-sm-6 offset-sm-3 rounded mb-5">
            <usersList></usersList>
        </div>
    </div>
  </div>
</template>

<script>
import usersList from '../components/UsersList.vue'

export default {
    data () {
        return {
            username: '',
            password: ''
        }
    },
    components: {
        usersList
    },
    created () {
        this.init();
    },
    methods: {
        init () {
            this.showUserName();
        },
        showUserName () {
            this.username = JSON.parse(localStorage.getItem('user')).email;
        },
        openPersonalArea () {
            this.$router.push('/personalarea');
        },
        logout () {
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

</style>