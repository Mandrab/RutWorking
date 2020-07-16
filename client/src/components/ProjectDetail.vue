<template>
    <div class="col-sm-12 offset-sm-0">
        <div class="projectInfo" v-if="projectReady">
            <div v-if="isProjectChief" class="row">
                <div class="col-12 col-sm-9 col-md-9 col-xl-9 text-left pl-0">
                    <h2>{{ project.name }}</h2>
                </div>
                <div class="col-10 col-sm-2 col-md-2 col-xl-2 text-left pl-0" v-bind:style="{ color: deadlineColor }">
                    Deadline: {{ new Date(project.deadline).getDate() }}/{{ new Date(project.deadline).getMonth() + 1}}/{{ new Date(project.deadline).getFullYear() }}
                </div>
                <div class="col-2 col-sm-1 col-md-1 col-xl-1">
                    <button class="btn btn-primary" @click="showModalForm">+</button>
                </div>
            </div>

            <div v-if="!isProjectChief" class="row">
                <div class="col-12 col-sm-10 col-md-10 col-xl-10 text-left pl-0">
                    <h2>{{ project.name }}</h2>
                </div>
                <div class="col-12 col-sm-2 col-md-2 col-xl-2 text-left pl-0" v-bind:style="{ color: deadlineColor }">
                    Deadline: {{ new Date(project.deadline).getDate() }}/{{ new Date(project.deadline).getMonth() + 1}}/{{ new Date(project.deadline).getFullYear() }}
                </div>
            </div>

            <div class="row">
                <div class="float-lg-left text-left mt-2">
                    {{ project.description }}
                </div>
            </div>
        </div>

        <modulesList v-if="projectReady" @clickModule="openModule" @refreshModulesList="getProjectInfo" :modules="modulesArr" :projectName="project.name"></modulesList>

        <createModuleFormModal v-if="showModal" :project="project" @closeModal="closeModal" @moduleAdded="getProjectInfo"></createModuleFormModal>
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
            projectReady: false,
            deadlineColor: 'black'
        }
    },
    components: {
        createModuleFormModal,
        modulesList
    },
    props: {
        project: {
            type: Object
        }
    },
    created () {
        this.getProjectInfo();
        this.checkDeadline();
        if (JSON.parse(localStorage.getItem('user')).email == this.project.chief) {
            this.isProjectChief = true;
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
            
        }
    },
    methods: {
        showModalForm () {
            this.showModal = true;
        },
        closeModal () {
            this.showModal = false;
        },
        getProjectInfo() {
            this.projectReady = false;
            var vm = this;
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            console.log(localStorage.getItem('path') + '/projects/project/'+this.project.name);
            vm.$http.get(localStorage.getItem('path') + '/projects/project/'+this.project.name, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                    res = JSON.parse(res);
                } catch (error) {console.log(error)}
                this.projectDetail = res;//lo memorizzo nei data di questa view per poi poterlo passare al componente container (tramite props) che lo userà per creare i componenti tiles

                this.modulesArr = res.modules;

                console.log(this.modulesArr);

                this.projectReady = true;
            }, (err) => {
                alert("err");
                alert(err.body);
                console.log(err.body);
                this.projectReady = true;
            });
        },
        checkDeadline () {
            //this.projectReady = false;
            console.log("____________ ________________ _______________")
            console.log(this.project);
            var date = new Date(this.project.deadline);
            
            var weekLater = new Date();
            var today = new Date();
            weekLater.setDate(date.getDate()+7);

            alert(date >= today && date <= weekLater)
            if (date >= today && date <= weekLater ) {
                this.deadlineColor = 'orange';
            }
            else if(date < today) {
                this.deadlineColor = 'red';
            } else { 
                this.deadlineColor = 'green';
            }
            this.ready = true;
        },
        openModule (event) {
            console.log(event);
            //if (JSON.parse(localStorage.getItem('module'))) {
                //alert("errore: c'è già qualcosa dentro al localstorage");
            //} else {
                event["project"] = this.project.name;
                localStorage.setItem('module', JSON.stringify(event));
                this.$router.push('/workingarea');
            //}
            
        }
    }
};
</script>

<style scoped>

/*
@media (min-width: 576px) {
    .projectInfo {
      padding: 24px !important;
    }
}*/

</style>

