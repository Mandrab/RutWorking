<template>
    <div class="col-sm-4 col-md-4 col-xl-4 offset-sm-4 offset-md-4 offset-xl-4">
        <h2>Login</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" v-model="username" v-validate="'required'" name="username" class="form-control" :class="{ 'is-invalid': submitted && errors.has('username') }" />
                <div v-if="submitted && errors.has('username')" class="invalid-feedback">{{ errors.first('username') }}</div>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" v-model="password" v-validate="'required'" name="password" class="form-control" :class="{ 'is-invalid': submitted && errors.has('password') }" />
                <div v-if="submitted && errors.has('password')" class="invalid-feedback">{{ errors.first('password') }}</div>
            </div>
            <div class="form-group">
                <button @click.prevent="handleSubmit" class="btn btn-primary" :disabled="loggingIn">Sign in</button>
                <img v-show="loggingIn" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>
            <!--<div v-show="showModal" class="text-danger">{{loginResponse}}</div>-->
            <simpleModal v-if="showModal" :mess="loginResponse" @closeModal="closeModal" ></simpleModal>
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
            loginResponse: '',
            showModal: false,
            closed: true
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
            this.showModal=false;
            //const { username, password } = this;
            if (this.closed) {
                this.$validator.validate().then(valid => {
                    if (valid) {
                        this.login(this.username, this.password);
                    }
                });
            }
            this.closed = true;
        },
        login(username, password) {
            var path = 'http://localhost:8080';
            localStorage.setItem('path', path);
            this.loggingIn = true;
            var vm = this;
            var json = { 'userEmail': username, 'password': password };
            vm.$http.post(localStorage.getItem('path') + '/login', json).then(function(response) {
                console.log(response.body);
                console.log(response.body.accessToken); //
                var obj = { email: username, token: response.body.accessToken };
                localStorage.removeItem('user');
                localStorage.setItem('user', JSON.stringify(obj));
                var user = JSON.parse(localStorage.getItem('user')); //
                console.log("USER LOGGED-IN");
                console.log(user); //
                this.$router.push('/');
            },(err) => {
                console.log(err.body);
                this.loginResponse = err.body;
                this.loggingIn = false;
                this.showModal=true;
            });
        },
        logout () {
            localStorage.removeItem('user');
        }
    }
};
</script>
