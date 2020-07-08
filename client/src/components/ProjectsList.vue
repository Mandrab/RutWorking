<template>
                <aside>
					<ul class="list-group">
					<li class="list-group-item">My Projects
                        <button @click="showProjectCreation" class="btn btn-primary" :disabled="creating">+</button>
					</li>
                    <projectTile v-for="(tile, index) in projectsArr" :item="tile" :key="index"></projectTile>
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
            this.$emit('show');
        },
        showProject () {
            console.log(this.projects);
            this.projects.forEach(p => {
                this.projectsArr.push(p);
            });
        }
        
    }
};
</script>