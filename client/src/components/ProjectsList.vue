<template>
    <div>
        <li class="list-group-item">
            <div class="row">
                <div class="col-10 col-sm-10 col-md-9 col-xl-9 p-0 h3">
                    My Projects
                </div>
                <div class="col-2 col-sm-2 col-md-3 col-xl-3 p-0">
                    <button @click="showProjectCreation" class="btn btn-primary">+</button>
                </div>
            </div>
		</li>
        <div>
            <ul class="list-group">
            <projectTile v-for="(tile, index) in display" :item="tile" :key="index" @openDetail="openDetail"></projectTile>
		</ul>
        <paginazione v-if="ready" :array="projectsArr" limit="6" @displayChanged="dispatchedPagination($event)" shown="8" :bottom="true"></paginazione>
        </div>
		

	</div>
</template>

<script>
import projectTile from '../components/ProjectTile.vue'
import paginazione from '../components/paginazione.vue'

export default {
    data () {
        return {
            projectsArr: [],
            readu: false,
            display: []
        }
    },
    props: {
        projects: {
            type: Array
        }
    },
    created () {
        this.showProjectList();
        this.ready = true;
    },
    components: {
        projectTile,
        paginazione
    },
    methods: {
        showProjectCreation () {
            this.$emit('showCreationForm');
        },
        showProjectList () {
            console.log(this.projects);
            this.projects.forEach(p => {
                this.projectsArr.push(p);
            });
        },
        openDetail (event) {
            this.$emit('detail', event);
        },
        dispatchedPagination: function (toDisplay) {
            this.display = toDisplay;
        }
    }
};
</script>