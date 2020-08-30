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
    data () {
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
    created() {
        this.getProjectInfo();
        this.checkDeadline();
        if (JSON.parse(localStorage.getItem('user')).email == this.project.chief) {
            this.isProjectChief = true;
        }
        this.projectInfo = {'projectName': this.project.name, 'isProjectChief': this.isProjectChief };

        this.isModulesMember = this.isMember;
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
            this.projectInfo = {'projectName': this.project.name, 'isProjectChief': this.isProjectChief }
        },
        isMember: function () {
            this.isModulesMember = this.isMember;
        }
    },
    methods: {
        showModalForm () {
            this.showModal = true;
        },
        closeModal () {
            this.showModal = false;
        },
        updateList(){
            this.$emit('getModulesInfo');
        },
        getProjectInfo() {
            this.projectReady = false;

            if(localStorage.getItem('projectName')){
                localStorage.removeItem('projectName');
            }
            if(localStorage.getItem('isProjectChief')){
                localStorage.removeItem('isProjectChief');
            }

            localStorage.setItem('projectName', this.project.name); ////////

            localStorage.setItem('isProjectChief', this.isProjectChief); ///////
            
            
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            console.log(localStorage.getItem('path') + '/projects/project/'+this.project.name);


            this.$http.get(localStorage.getItem('path') + '/projects/project/' + localStorage.getItem('projectName'), tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                
                this.projectDetail = res;

                this.modulesArr = res.modules;

                console.log(this.modulesArr);

                this.projectReady = true;
            }, (err) => {
                console.log(err.body);
                this.projectReady = true;
            });
        },
        checkDeadline() {
            this.deadlineReady = false;

            var date = new Date(this.project.deadline);
            var weekLater = new Date();
            var today = new Date();
            weekLater.setDate(date.getDate() + 7);

            if (date >= today && date <= weekLater) {
                this.deadlineColor = 'orange';
            } else if(date < today) {
                this.deadlineColor = 'red';
            } else { 
                this.deadlineColor = 'green';
            }
            this.deadlineReady = true;
        },
        openModule(event) {
            console.log(event);
            //if (JSON.parse(localStorage.getItem('module'))) {
                //alert("errore: c'è già qualcosa dentro al localstorage");
            //} else {
                event["project"] = this.project.name;
                localStorage.setItem('module', JSON.stringify(event));
                var isModuleChief = false;
                console.log("AAAAAAAA");
                console.log(JSON.stringify(event));
                console.log(JSON.parse(localStorage.getItem('user')).email);
                if (JSON.parse(localStorage.getItem('user')).email == event.chief) {
                    isModuleChief = true;
                    console.log("XXXXXXXXXX");
                    console.log(isModuleChief);
                }
                localStorage.setItem('isModuleChief', isModuleChief); ///
                
                localStorage.setItem('isProjectChief', this.isProjectChief);
                this.$router.push('/workingarea');
            //}
            
        }
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

