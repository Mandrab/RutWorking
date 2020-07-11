<template>
    <div class="col-sm-6 offset-sm-3">
        <h2>Create Project</h2>
        {{ this.project.name }}
        {{ this.project.description }}
        {{ this.project.deadline }}
        <button class="btn btn-primary" v-if="isProjectChief" @click="showModalForm">+</button>
        {{ this.project.modules }}


        <!-- Lista di moduli component -->

        <createModuleFormModal v-if="showModal" :project="project" @closeModal="closeModal" @moduleAdded="getModules"></createModuleFormModal>
    </div>
</template>

<script>

import createModuleFormModal from './CreateModuleFormModal.vue';
export default {
    data () {
        return {
            creating: false,
            projectsArr: [],
            projectDetail: {},
            isProjectChief: false,
            showModal: false,
            modules: []
        }
    },
    components: {
        createModuleFormModal
    },
    props: {
        project: {
            type: Object
        }
    },
    created () {
        this.projectDetail = this.project;
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
        getModules () {
            /*
            this.project.modules.forEach(m => {
                
            } )
            
            modules.add(.....)*/
        }
        
    }
};
</script>