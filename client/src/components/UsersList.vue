<template>
    <div>
        <li class="list-group-item bg-light">
            <div class="row">
                <div class="col-10 col-sm-10 col-md-10 col-xl-10 h3 text-left">
                    Users list
                </div>
                <div class="col-2 col-sm-2 col-md-2 col-xl-2 p-0">
                    <button @click="openUserRegistration" class="btn btn-primary"><font-awesome-icon icon="plus"/></button>
                </div>
            </div>
		</li>
        <div>
            <ul v-if="isUsersListReady" class="list-group">
                <userTile v-for="(tile, index) in usersArr" :item="tile" :key="index" :index="index" @userBlocked="showUsersList"></userTile>
                <infinite-loading v-if="moreUsers" @infinite="showMoreUsers($event)"></infinite-loading>
            </ul>
        </div>

        <registerUserFormModal v-if="registerUser" @userAdded="showUsersList" @closeModal="closeUserRegistration"></registerUserFormModal>
	</div>
</template>

<script src="https://unpkg.com/vue-infinite-loading@^2/dist/vue-infinite-loading.js"></script>

<script>
import userTile from '../components/UserTile.vue'
import registerUserFormModal from '../components/RegisterUserFormModal.vue'
import infiniteLoading from 'vue-infinite-loading';

export default {
    data() {
        return {
            usersArr: [],
            isUsersListReady: false,
            registerUser: false,
            moreUsers: false,
            skipN: 100,
        }
    },
    components: {
        userTile,
        registerUserFormModal,
        infiniteLoading
    },
    methods: {
        showUsersList() {
            this.isUsersListReady = false;
            this.skipN = 100;
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            
            this.$http.get(localStorage.getItem('path') + '/users', tokenJson).then(function() {
                var res = response.body;
                this.usersArr = res;
                if (this.usersArr.length == 100) {
                    this.moreUsers = true;
                } else {
                    this.moreUsers = false;
                }
                this.isUsersListReady = true;
            }, (err) => {
                console.log(err.body);
            });
        },
        showMoreUsers($state) {
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            
            this.$http.get(localStorage.getItem('path') + '/users/' + this.skipN, tokenJson).then(function(response) {
                var res = response.body;
                this.usersArr = this.usersArr.concat(res);
                $state.loaded();
                if (res.legnth == 100) {
                    this.moreUsers = true;
                } else {
                    this.moreUsers = false;
                    $state.complete();
                }
                this.skipN += 100;
            }, (err) => {
                console.log(err.body);
            });
        },
        openUserRegistration() {
            this.registerUser = true;
        },
        closeUserRegistration() {
            this.registerUser = false;
        }
    },
    created() {
        this.showUsersList();
        this.ready = true;
    },
};
</script>

<style >
.scroll-area {
  position: relative;
  margin: auto;
  width: 600px;
  height: 400px;
}
</style>