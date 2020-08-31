<template>
    <div>
        <li class="list-group-item bg-light">
            <div class="row">
                <div class="col-10 col-sm-10 col-md-9 col-xl-9 p-0 h3">
                    My projects
                </div>
                <div class="col-2 col-sm-2 col-md-3 col-xl-3 p-0">
                    <button @click="showProjectCreation" class="btn btn-primary"><font-awesome-icon icon="plus"/></button>
                </div>
            </div>
		</li>
        <div>
            <ul v-if="dispReady" class="list-group">
                <projectTile v-for="(tile, index) in display" :item="tile" :key="index" @openDetail="openDetail" @projectDeleted="updateProjectsList" :isChief="isChief[page+index]" :isMember="isModulesMember[page + index]" :index="index" :page="page"></projectTile>
		    </ul>
        <pagination v-if="ready" :array="projectsArr" limit="6" @displayChanged="dispatchedPagination($event)" shown="8" :bottom="true"></pagination>
        </div>
	</div>
</template>

<script>
import projectTile from '../components/ProjectTile.vue'
import pagination from '../components/Pagination.vue'

export default {
    data() {
        return {
            projectsArr: [],
            isModulesMember: [],
            isChief: [],
            display: [],
            page: 0,
            dispReady: true
        }
    },
    components: {
        projectTile,
        pagination
    },
    props: {
        projects: {
            type: Array
        },
        isMember: {
            type: Array
        }
    },
    methods: {
        showProjectList() {
            this.projects.forEach(p => {
                this.projectsArr.push(p);
            });
            this.isMember.forEach(m => {
                this.isModulesMember.push(m);
            });
            var username = JSON.parse(localStorage.getItem('user')).email;
            this.projects.forEach(m => {
                if (m.chief == username){
                    this.isChief.push(true);
                } else {
                    this.isChief.push(false);
                }
            });
        },
        dispatchedPagination: function (toDisplay) {
            this.dispReady = false;
            this.page = this.projectsArr.indexOf(toDisplay[0]);
            this.display = toDisplay;
            this.dispReady = true;
        },
        openDetail(event1, event2) {
            this.$emit('detail', event1, event2);
        },
        updateProjectsList() {
            this.$emit('projectDeleted');
        },
        showProjectCreation() {
            this.$emit('showCreationForm');
        },
    },
    created() {
        this.showProjectList();
        this.ready = true;
    }
};
</script>