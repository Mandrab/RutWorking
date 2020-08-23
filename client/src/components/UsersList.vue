<template>
    <div>
        <li class="list-group-item">
            <div class="row">
                <div class="col-10 col-sm-10 col-md-9 col-xl-9 p-0 h3">
                    Users list
                </div>
                <div class="col-2 col-sm-2 col-md-3 col-xl-3 p-0">
                    <button @click="openUserRegistration" class="btn btn-primary">+</button>
                </div>
            </div>
		</li>
        <div>
            <ul v-if="isUsersListReady" class="list-group">
                <userTile v-for="(tile, index) in usersArr" :item="tile" :key="index" :index="index" :page="page"></userTile>
		    </ul>
        <pagination v-if="ready" limit="100" @displayChanged="dispatchedPagination($event)" shown="8" :bottom="true"></pagination>
        </div>

        <registerUserFormModal v-if="registerUser" @userAdded="showUsersList" @closeModal="closeUserRegistration"></registerUserFormModal>
	</div>
</template>

<script>
import userTile from '../components/UserTile.vue'
import pagination from '../components/Pagination.vue'

export default {
    data() {
        return {
            usersArr: [],
            isUsersListReady: false,
            registerUser: false,
            display: [],
            page: 0,
            dispReady: true
        }
    },
    props: {
    },
    created() {
        this.showUsersList();
        this.ready = true;
    },
    components: {
        userTile,
        pagination
    },
    methods: {
        showUsersList() {
            this.isUsersListReady = false;
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            
            this.$http.get(localStorage.getItem('path') + '/users', tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                this.usersArr = res;

                this.isUsersListReady = true;
            }, (err) => {
                alert(err.body);
            });
        },
        openUserRegistration() {
            this.registerUser = true;
        },
        closeUserRegistration() {
            this.registerUser = false;
        },
        dispatchedPagination: function (toDisplay) {
            this.dispReady = false;
            //finding actual page
            //alert(this.projectsArr.indexOf(toDisplay[0]))
            var tmp = this.projectsArr.indexOf(toDisplay[0]);
            this.page = tmp;


            //console.log(this.isModulesMember);
            //console.log(tmp+2)
            //console.log(this.isModulesMember[tmp+2])
            //alert(this.isModulesMember[2+tmp])
            console.log("çççççççççççççççççççççççççç")


            this.display = toDisplay;

            this.dispReady = true;
        }
    }
};
</script>