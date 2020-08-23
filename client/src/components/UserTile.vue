<template>
    <div v-if="ready">
        <li class="list-group-item" @click="openDetail"> 
        <div v-if="!isBlocked" class="row">
            <div class="col-9 col-sm-9 col-md-9 col-xl-9 font-weight-bold h5 text-left">
                {{ item.email }}
            </div>
            <div class="col-3 col-sm-3 col-md-3 col-xl-3 text-right">
                <button @click="blockUser">B</button>
            </div>
        </div>
        <div v-if="isBlocked" class="row">
            <div class="col-9 col-sm-9 col-md-9 col-xl-9 font-weight-bold h5 text-secondary text-left">
                {{ item.email }}
            </div>
            <div class="col-3 col-sm-3 col-md-3 col-xl-3 text-right">
                <button disabled>B</button>
            </div>
        </div>
    </li>

    <userDetailModal v-if="showUserDetail" @closeModal="closeDetail"></userDetailModal>

    </div>
</template>

<script>
export default {
    data() {
        return {
            username: '',
            isBlocked: false,
            ready: false,
            //userIndexInList: 0,
            showUserDetail: false
        }
    },
    created () {
        console.log(this.item);
        this.ready = false;
        this.username = JSON.parse(localStorage.getItem('user')).email;
        this.isBlocked = this.item.blocked;
        this.userIndexInList = this.index;
        this.ready = true;
    },
    props: {
        item: {
            type: Object
        },
        index: {
            type: Number
        }
    },
    methods: {
        openDetail() {
            this.showUserDetail = true;
            //this.$emit('openDetail', this.item, this.userIndexInList+this.page);
        },
        closeDetail() {
            this.showUserDetail = false;
        },
        blockUser() {
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            
            this.$http.delete(localStorage.getItem('path') + '/user/' + this.username, tokenJson).then(function(response) {
                alert(response.body);
            }, (err) => {
                alert(err.body);
            });
        }
    }
};
</script>

<style scoped>
.list-group-item:hover {
    background-color: lightgray;
}
</style>