<template>
    <div class="col-sm-4 col-md-4 col-xl-4 offset-sm-4 offset-md-4 offset-xl-4" style="padding: 60px 0px; height: 80vh;">
        <h2>Login</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" v-model="username" name="username" class="form-control" :class="{ 'is-invalid': submitted && !username }" />
                <div v-show="submitted && !username" class="invalid-feedback">Username is required</div>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" v-model="password" name="password" class="form-control" :class="{ 'is-invalid': submitted && !password }" />
                <div v-show="submitted && !password" class="invalid-feedback">Password is required</div>
            </div>
            <div class="form-group">
                <button v-if="!loggingIn" @click.prevent="handleSubmit" class="btn btn-primary" :disabled="loggingIn">Sign in</button>
                <font-awesome-icon v-if="loggingIn" style="color: gray;" icon="spinner" size="2x" pulse/>
            </div>

            <simpleModal v-if="showModal" :title="title" :message="loginResponse" :secondaryMessage="secondaryMessage" @closeModal="closeModal"></simpleModal>
        </form>
    </div>
</template>

<script>
import simpleModal from '../components/SimpleModal.vue'

export default {
    data() {
        return {
            username: '',
            password: '',
            submitted: false,
            loggingIn: false,
            showModal: false,
            closed: true,
            title: 'Login failed',
            loginResponse: '',
            secondaryMessage: 'Please try again'
        }
    },
    components: {
        simpleModal
    },
    methods: {
        handleSubmit() {
            this.submitted = true;
            this.showModal = false;
            if (this.username && this.password && this.closed) {
                this.login(this.username, this.password);
            }
            this.closed = true;
        },
        login(username, password) {
            var path = 'http://localhost:8080';
            localStorage.removeItem('path');
            localStorage.setItem('path', path);
            this.loggingIn = true;
            var json = { 'userEmail': username, 'password': password };

            this.$http.post(localStorage.getItem('path') + '/login', json).then(function(response) {
                var obj = { email: username, token: response.body.accessToken };
                localStorage.removeItem('user');
                localStorage.setItem('user', JSON.stringify(obj));
                var role = response.body.userRole;
                localStorage.removeItem('role');
                localStorage.setItem('role', role);
                localStorage.removeItem('notifications');
                localStorage.setItem('notifications', 0);
                if (role == "admin") {
                    this.$router.push('/adminpage');
                } else {
                    this.$router.push('/');
                }
            }, (err) => {
                this.loginResponse = err.body;
                this.loggingIn = false;
                this.showModal = true;
            });
        },
        logout() {
            localStorage.removeItem('user');
        },
        closeModal() {
            this.showModal = false;
            this.closed = false;
        }
    },
    created() {
        this.logout();
    }
};
</script>
