<template>
    <div class="col-sm-12 offset-sm-0 detail-project">
        <div v-if="projectReady">
            <div v-if="isProjectChief" class="row">
                <div class="col-12 col-sm-9 col-md-9 col-xl-9 text-left pl-0">
                    <h2>{{ project.name }}</h2>
                </div>
                <div class="col-10 col-sm-2 col-md-2 col-xl-2 text-left pl-0" v-bind:style="{ color: deadlineColor }">
                    Deadline: {{ new Date(project.deadline).getDate() }}/{{ new Date(project.deadline).getMonth() + 1}}/{{ new Date(project.deadline).getFullYear() }}
                </div>
                <div class="col-2 col-sm-1 col-md-1 col-xl-1">
                    <button class="btn btn-primary" @click="showModalForm"><font-awesome-icon icon="plus"/></button>
                </div>
            </div>

            <div v-if="!isProjectChief" class="row">
                <div class="col-12 col-sm-10 col-md-10 col-xl-10 text-left pl-0">
                    <h2>{{ project.name }}</h2>
                </div>
                <div v-if="deadlineReady" class="col-12 col-sm-2 col-md-2 col-xl-2 text-left pl-0" v-bind:style="{ color: deadlineColor }">
                    Deadline: {{ new Date(project.deadline).getDate() }}/{{ new Date(project.deadline).getMonth() + 1}}/{{ new Date(project.deadline).getFullYear() }}
                </div>
            </div>

            <div class="row">
                <div class="float-lg-left text-left mt-2">
                    {{ project.description }}
                </div>
            </div>
        </div>
        <div v-else>
            <font-awesome-icon style="color: gray;" icon="spinner" pulse size="2x"/>
        </div>

        <modulesList v-if="projectReady" @clickModule="openModule" @refreshModulesList="updateList" :modules="modulesArr" :projectInfo="projectInfo" :isModulesMember="isModulesMember"></modulesList>

        <createModuleFormModal v-if="showModal" :project="project" @closeModal="closeModal" @moduleAdded="updateList"></createModuleFormModal>
    </div>
</template>

<script>
import createModuleFormModal from './CreateModuleFormModal.vue';
import modulesList from './ModulesList.vue';

export default {
    data() {
        return {
            creating: false,
            projectsArr: [],
            projectDetail: {},
            isProjectChief: false,
            showModal: false,
            modulesArr: [],
            isModulesMember: [],
            projectReady: false,
            deadlineReady: false,
            deadlineColor: 'black',
            projectInfo: {}
        }
    },
    components: {
        createModuleFormModal,
        modulesList
    },
    props: {
        project: {
            type: Object
        },
        isMember: {
            type: Array
        }
    },
    watch: {
        project: function () {
            if (JSON.parse(localStorage.getItem('user')).email == this.project.chief) {
                this.isProjectChief = true;
            } else {
                this.isProjectChief = false;
            }
            this.checkDeadline();
            this.getProjectInfo();
            this.projectInfo = { 'projectName': this.project.name, 'isProjectChief': this.isProjectChief }
        },
        isMember: function () {
            this.isModulesMember = this.isMember;
        }
    },
    methods: {
        getProjectInfo() {
            this.projectReady = false;
            localStorage.removeItem('projectName');
            localStorage.setItem('projectName', this.project.name);
            localStorage.removeItem('isProjectChief');
            localStorage.setItem('isProjectChief', this.isProjectChief);
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            
            this.$http.get(localStorage.getItem('path') + '/projects/project/' + localStorage.getItem('projectName'), tokenJson).then(function(response) {
                var res = response.body;
                this.projectDetail = res;
                this.modulesArr = res.modules;
                this.projectReady = true;
            }, (err) => {
                console.log(err.body);
                this.projectReady = true;
            });
        },
        checkDeadline() {
            this.deadlineReady = false;
            var projectDeadline = new Date(this.project.deadline);
            var today = new Date();
            var weekLater = new Date(today);
            weekLater.setDate(today.getDate() + 7);
            if (projectDeadline >= today && projectDeadline <= weekLater) {
                this.deadlineColor = 'orange';
            } else if (projectDeadline < today) {
                this.deadlineColor = 'red';
            } else { 
                this.deadlineColor = 'green';
            }
            this.deadlineReady = true;
        },
        showModalForm() {
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        updateList(){
            this.$emit('getModulesInfo');
        },
        openModule(event) {
            event["project"] = this.project.name;
            localStorage.removeItem('module');
            localStorage.setItem('module', JSON.stringify(event));
            var isModuleChief = false;
            if (JSON.parse(localStorage.getItem('user')).email == event.chief) {
                isModuleChief = true;
            }
            localStorage.removeItem('isModuleChief');
            localStorage.setItem('isModuleChief', isModuleChief);
            localStorage.removeItem('isProjectChief');
            localStorage.setItem('isProjectChief', this.isProjectChief);
            
            this.$router.push('/workingarea');
        }
    },
    created() {
        this.getProjectInfo();
        this.checkDeadline();
        if (JSON.parse(localStorage.getItem('user')).email == this.project.chief) {
            this.isProjectChief = true;
        }
        this.projectInfo = { 'projectName': this.project.name, 'isProjectChief': this.isProjectChief };
        this.isModulesMember = this.isMember;
    }
};
</script>

<style scoped>
@media (max-width: 576px) {
    .detail-project {
      padding: 0px !important;
    }
}
</style>

