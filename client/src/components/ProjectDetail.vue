<template>
    <div class="col-sm-6 offset-sm-3">
        <h2>Create Project</h2>
        {{ this.project.name }}
        {{ this.project.description }}
        {{ this.project.deadline }}
        <button class="btn btn-primary" v-if="isProjectChief" @click="showModalForm">+</button>
        {{ this.project.modules }}
    </div>
</template>

<script>


export default {
    data () {
        return {
            creating: false,
            projectsArr: [],
            projectDetail: {},
            isProjectChief: false
        }
    },
    components: {

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
        alert(this.project.chief + " " + JSON.parse(localStorage.getItem('user')).email);

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
            alert("form modale");
        },
        getModulesDetail () {
            /*
            this.project.modules.forEach(m => {
                
            } )*/
        }
        
    }
};
</script>