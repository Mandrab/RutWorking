<template>
  <div class="container-fluid">
    <navbar :firstDropdownItem="firstDropdownItem" :chatNotifications="notificationsNumber"></navbar>

    <div v-if="moduleReady" class="mt-4"> 
        <div class="row pb-1">
            <div class="col-12 col-sm-8 col-md-8 col-xl-8 text-left">
                <h2> <b>[{{ module.project }}]</b> {{ module.name }} <span v-if="isModuleChief" class="add-user-btn" @click.stop="addDeveloper"><font-awesome-icon icon="user-plus" class="add-user-icon" size="sm"/></span> </h2> 
                
            </div>
            <div class="col-12 col-sm-4 col-md-4 col-xl-4 text-right p-0" v-bind:style="{ color: deadlineColor }">
                Deadline: {{ new Date(module.deadline).getDate() }}/{{ new Date(module.deadline).getMonth() + 1}}/{{ new Date(module.deadline).getFullYear() }}
            </div>
        </div>

        <div class="row px-3">
            <div class="float-lg-left text-left">
                {{ module.description }}
            </div>
        </div>
        
    </div>
    <div v-else>
        <font-awesome-icon style="color: gray;" icon="spinner" pulse size="4x"/>
    </div>

    <div class="row mt-3">
        <div class="col-sm-12 col-md-12 col-xl-12">
            <kanban ref="children" :stages="statuses" :module="module" @showConfirmationModal="askConfirmation"></kanban>
        </div>
        <div style="z-index: 2;">
            <chat :module="module" @notificationsNumber="updateNavbarNotificationsCount"></chat>
        </div>
    </div>

    <addUserInModuleFormModal v-if="showModal" :projectName="module.project" :moduleName="module.name" @closeModal="closeModal"></addUserInModuleFormModal>
    <confirmationModal v-if="showConfirmationModal" :title="title" :message="message" @proceed="proceed" @cancel="cancel"></confirmationModal>
  </div>
</template>

<script>
import navbar from '../components/Navbar.vue'
import addUserInModuleFormModal from '../components/AddUserInModuleFormModal.vue'
import chat from '../components/Chat.vue'
import kanban from '../components/Kanban.vue'
import confirmationModal from '../components/ConfirmationModal.vue'

export default {
    data() {
        return {
            username: '',
            isModuleChief: false,
            firstDropdownItem: 'personal-area',
            notificationsNumber: 0,
            module: {},
            moduleReady: false,
            deadlineColor: 'black',
            statuses: ['TO-DO', 'ASSIGNED', 'IN-PROGRESS', 'DONE'],
            showModal: false,
            showConfirmationModal: false,
            title: '',
            message: ''
        }
    },
    components: {
        navbar,
        addUserInModuleFormModal,
        kanban,
        chat,
        confirmationModal
    },
    destroyed() {
        localStorage.removeItem('projectName');
        localStorage.removeItem('moduleName');
        localStorage.removeItem('isProjectChief');
        localStorage.removeItem('isModuleChief')
    },
    
    methods: {
        init() {
            
            this.showUserName();
            this.module = JSON.parse(localStorage.getItem('module'));
            
            var username = JSON.parse(localStorage.getItem('user')).email;
            if(this.module.chief == username){
                this.isModuleChief = true;
            }else{
                this.isModuleChief = false;
            }
            this.moduleReady = true;
        },
        showUserName() {
            this.username = JSON.parse(localStorage.getItem('user')).email;
        },
        checkDeadline() {
            this.moduleReady = false;
            var date = new Date(this.module.deadline);
            var weekLater = new Date();
            var today = new Date();
            weekLater.setDate(date.getDate()+7);
            if (date >= today && date <= weekLater ) {
                this.deadlineColor = 'orange';
            } else if (date < today) {
                this.deadlineColor = 'red';
            } else { 
                this.deadlineColor = 'green';
            }
            this.moduleReady = true;
        },
        addDeveloper() {
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        askConfirmation() {
            this.title = 'Delete task';
            this.message = 'Do you want to delete this task?';
            this.showConfirmationModal = true;
        },
        proceed() {
            this.showConfirmationModal = false;
            var projectName = localStorage.getItem('projectName');
            var moduleName = JSON.parse(localStorage.getItem('module')).name;
            var taskId = localStorage.getItem('taskId');
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.delete(localStorage.getItem('path') + '/projects/' + projectName + '/modules/' + moduleName + '/kanban/' + taskId, tokenJson).then(function() {
                this.$refs.children.getTasks();;
            }, (err) => {
                console.log(err.body);
            }); 
            //this.$refs.children.prova();
        },
        cancel() {
            this.showConfirmationModal = false;
        },
        updateNavbarNotificationsCount($event) {
            this.notificationsNumber = Number.parseInt($event);
        },
        openPersonalArea() {
            this.$router.push('/personalarea');
        },
        openHomePage() {
            this.$router.push('/');
        },
        logout() {
            this.$router.push('/login');
        },
    },
    created () {
        this.init();
        this.checkDeadline();
    }
};
</script>

<style scoped>
.add-user-btn {
    margin: 3px;
    background-color: none;
    cursor: pointer;
}

.add-user-icon {
    margin: 3px;
    color: #007BFF;
}

.add-user-icon:hover {
    color: #0069D9;
}
</style>

