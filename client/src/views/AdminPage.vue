<template>
  <div class="container-fluid">
    <navbar :firstDropdownItem="firstDropdownItem"></navbar>

    <div class="row mt-5">
        <div class="col-sm-6 offset-sm-3 rounded mb-5">
            <usersList></usersList>
        </div>
    </div>
  </div>
</template>

<script>
import navbar from '../components/Navbar.vue';
import usersList from '../components/UsersList.vue'

export default {
    data () {
        return {
            username: '',
            password: '',
            firstDropdownItem: 'personal-area',
        }
    },
    components: {
        navbar,
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