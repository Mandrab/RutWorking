<template>
    <li class="list-group-item" @click="open" :isMember="isModulesMember"> 
        <div class="row">
            <div class="col-9 col-sm-9 col-md-9 col-xl-9 font-weight-bold h5 text-left">
                {{ item.name }}
            </div>
            <div class="col-3 col-sm-3 col-md-3 col-xl-3 text-right">
                <div v-if="isProjectChief" @click="askConfirmation" class="delete-btn"><font-awesome-icon class="delete-icon" icon="trash-alt" size="lg"/></div>
            </div>
        </div>
        <div v-if="ready" class="row float-right small" v-bind:style="{ color: deadlineColor }">
            {{ new Date(item.deadline).getDate() }}/{{ new Date(item.deadline).getMonth() + 1 }}/{{ new Date(item.deadline).getFullYear() }}
        </div>

        <confirmationModal v-if="showConfirmationModal" :title="title" :message="message" @proceed="proceed" @cancel="cancel"></confirmationModal>
    </li>
</template>

<script>
import confirmationModal from './ConfirmationModal.vue'

export default {
    data() {
        return {
            ready: false,
            deadlineColor: 'black',
            isProjectChief: false,
            isModulesMember: [],
            projectIndexInList: 0,
            showConfirmationModal: false,
            title: '',
            message: ''
        }
    },
    components: {
        confirmationModal
    },
    props: {
        item: {
            type: Object
        },
        isMember: {
            type: Array
        },
        index: {
            type: Number
        },
        page: {
            type: Number
        },
        isChief: {
            type: Boolean
        }
    },
    watch: {
        item: function () {
            this.isProjectChief = this.isChief;
            this.checkDeadline();
        }
    },
    methods: {
        checkDeadline() {
            this.ready = false;
            var projectDeadline = new Date(this.item.deadline);
            var today = new Date();
            var weekLater = new Date(today);
            weekLater.setDate(today.getDate() + 7);
            if (projectDeadline >= today && projectDeadline <= weekLater ) {
                this.deadlineColor = 'orange';
            } else if(projectDeadline < today) {
                this.deadlineColor = 'red';
            } else { 
                this.deadlineColor = 'green';
            }
            this.ready = true;
        },
        open() {
            this.$emit('openDetail', this.item, this.projectIndexInList + this.page);
        },
        askConfirmation() {
            this.title = 'Delete project';
            this.message = 'Do you want to delete this project?';
            this.showConfirmationModal = true;
        },
        proceed() {
            this.showConfirmationModal = false;
            this.deleteProject();
        },
        cancel() {
            this.showConfirmationModal = false;
        },
        deleteProject() {
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.delete(localStorage.getItem('path') + '/projects/project/' + this.item.name, tokenJson).then(function() {
                this.$emit('projectDeleted');
            }, (err) => {
                console.log(err.body);
            }); 
        }
    },
    created() {
        this.isProjectChief = this.isChief;
        this.checkDeadline();
        this.isModulesMember = this.isMember;
        this.projectIndexInList = this.index;
    }
};
</script>

<style scoped>
.list-group-item:hover {
    background-color: lightgray;
}

.delete-btn {
    position: absolute;
    top: 1px;
    right: 2px;
    color: #be0000;
    background-color: none;
    cursor: pointer;
}

.delete-icon:hover {
    color: #a50000;
}

.delete-icon {
    position: absolute;
    top: 1px;
    right: 2px;
    padding: 0px;
    margin: 0px;
    color: #be0000;
}
</style>