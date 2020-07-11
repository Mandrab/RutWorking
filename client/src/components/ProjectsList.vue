<template>
    <aside>
        <li class="list-group-item">
            <div class="row">
                <div class="col-10 p-0 h2">
                    My Projects
                </div>
                <div class="col-2 p-0">
                    <button @click="showProjectCreation" class="btn btn-primary" :disabled="creating">+</button>
                </div>
            </div>
		</li>
		<ul class="list-group">
            <projectTile v-for="(tile, index) in projectsArr" :item="tile" :key="index" @openDetail="openDetail"></projectTile>
		</ul>
	</aside>
</template>

<script>
import projectTile from '../components/ProjectTile.vue'

export default {
    data () {
        return {
            creating: false,
            projectsArr: []
        }
    },
    props: {
        projects: {
            type: Array
        }
    },
    created () {
        this.showProject();
    },
    components: {
        projectTile
    },
    methods: {
        showProjectCreation () {
            this.$emit('showCreationForm');
        },
        showProject () {
            console.log(this.projects);
            this.projects.forEach(p => {
                this.projectsArr.push(p);
            });
        },
        openDetail (event) {
            this.$emit('detail', event);
        }
        
    }
};
</script>