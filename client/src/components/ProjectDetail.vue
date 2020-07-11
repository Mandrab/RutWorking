<template>
    <div class="col-sm-6 offset-sm-3">
        <div class="projectInfo" v-if="projectReady">
            <h2>{{ this.project.name }}</h2>
            <div>
                Description: {{ this.project.description }}
            </div>
            <div>
                Deadline: {{ new Date(this.project.deadline).getDate() }}/{{ new Date(this.project.deadline).getMonth() }}/{{ new Date(this.project.deadline).getFullYear() }}
            </div>
            <button class="btn btn-primary" v-if="isProjectChief" @click="showModalForm">+</button>
            <!--{{ this.project.modules }}-->
        </div>

        <modulesList v-if="projectReady" @clickModule="openModule" :modules="modulesArr"></modulesList>

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
            projectReady: false
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
            //var json = { "user": this.username }//in realta la mail??? attenzione ai nomi
            vm.$http.get(localStorage.getItem('path') + '/projects/project/'+this.project.name, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                    res = JSON.parse(res);
                } catch (error) {console.log(error)}
                this.projectDetail = res;//lo memorizzo nei data di questa view per poi poterlo passare al componente container (tramite props) che lo userà per creare i componenti tiles

                this.modules = res.modules;

                this.projectReady = true;
            }, (err) => {
                alert(err);
                console.log(err.body);
                this.projectReady = true;
            });
        },
        openModule (event) {
            console.log(event);
        }
    }
};
</script>