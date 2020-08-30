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
                <button @click.prevent="handleSubmit" class="btn btn-primary" :disabled="loggingIn">Sign in</button>
                <img v-show="loggingIn" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>

            <simpleModal v-if="showModal" :title="title" :message="loginResponse" :secondaryMessage="secondaryMessage" @closeModal="closeModal"></simpleModal>
        </form>
    </div>
</template>

<script>
import simpleModal from '../components/SimpleModal.vue'

export default {
    data () {
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
    computed: {

    },
    created() {
        // reset login status
        this.logout();
    },
    methods: {
        closeModal() {
            this.showModal = false;
            this.closed = false;
        },
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
            localStorage.setItem('path', path);
            this.loggingIn = true;
            var json = { 'userEmail': username, 'password': password };
            this.$http.post(localStorage.getItem('path') + '/login', json).then(function(response) {
                console.log(response.body);
                console.log(response.body.accessToken); //
                var obj = { email: username, token: response.body.accessToken };
                localStorage.removeItem('user');
                localStorage.setItem('user', JSON.stringify(obj));
                var user = JSON.parse(localStorage.getItem('user')); //
                console.log("USER LOGGED-IN"); //
                console.log(user); //

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
        logout () {
            localStorage.removeItem('user');
        }
    }
};
</script>
