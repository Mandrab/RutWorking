<template>
    <div v-if="ready">
        <li class="list-group-item" @click="openDetail"> 
        <div v-if="!isBlocked" class="row">
            <div class="col-9 col-sm-9 col-md-9 col-xl-9 font-weight-bold h5 text-left">
                {{ item.email }}
            </div>
            <div class="col-3 col-sm-3 col-md-3 col-xl-3 text-right">
                <button @click.stop="askConfirmation" class="btn btn-link">Block</button>
            </div>
        </div>
        <div v-if="isBlocked" class="row">
            <div class="col-9 col-sm-9 col-md-9 col-xl-9 font-weight-bold h5 text-secondary text-left">
                {{ item.email }}
            </div>
            <div class="col-3 col-sm-3 col-md-3 col-xl-3 text-right">
                <button disabled class="btn btn-link p-1">Blocked</button>
            </div>
        </div>
    </li>

    <userDetailModal v-if="showUserDetail" :item="item" @closeModal="closeDetail"></userDetailModal>
    <confirmationModal v-if="showConfirmationModal" :title="title" :message="message" @proceed="proceed" @cancel="cancel"></confirmationModal>
    </div>
</template>

<script>
import userDetailModal from '../components/UserDetailModal.vue'
import confirmationModal from './ConfirmationModal.vue'

export default {
    data() {
        return {
            username: '',
            isBlocked: false,
            ready: false,
            showUserDetail: false,
            showConfirmationModal: false,
            title: '',
            message: ''
        }
    },
    components: {
        userDetailModal,
        confirmationModal
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
        },
        closeDetail() {
            this.showUserDetail = false;
        },
        askConfirmation() {
            this.title = 'Block user';
            this.message = 'Do you want to block this user?';
            this.showConfirmationModal = true;
        },
        proceed() {
            this.showConfirmationModal = false;
            this.blockUser();
        },
        cancel() {
            this.showConfirmationModal = false;
        },
        blockUser() {
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            
            this.$http.delete(localStorage.getItem('path') + '/user/' + this.item.email, tokenJson).then(function() {
                this.$emit('userBlocked');
            }, (err) => {
                console.log(err.body);
            });
        }
    },
    created() {
        this.ready = false;
        this.username = JSON.parse(localStorage.getItem('user')).email;
        this.isBlocked = this.item.blocked;
        this.userIndexInList = this.index;
        this.ready = true;
    }
};
</script>

<style scoped>
.list-group-item:hover {
    background-color: lightgray;
}
</style>