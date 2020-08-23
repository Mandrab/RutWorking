<template>
    <div>
        <li class="list-group-item">
            <div class="row">
                <div class="col-10 col-sm-10 col-md-9 col-xl-9 p-0 h3">
                    My projects
                </div>
                <div class="col-2 col-sm-2 col-md-3 col-xl-3 p-0">
                    <button @click="showProjectCreation" class="btn btn-primary">+</button>
                </div>
            </div>
		</li>
        <div>
            <ul v-if="dispReady" class="list-group">
                <projectTile v-for="(tile, index) in display" :item="tile" :key="index" @openDetail="openDetail" @projectDeleted="updateProjectsList" :isMember="isModulesMember[page+index]" :index="index" :page="page"></projectTile>
		    </ul>
        <pagination v-if="ready" :array="projectsArr" limit="6" @displayChanged="dispatchedPagination($event)" shown="8" :bottom="true"></pagination>
        </div>
		

	</div>
</template>

<script>
import projectTile from '../components/ProjectTile.vue'
import pagination from '../components/Pagination.vue'

export default {
    data () {
        return {
            projectsArr: [],
            isModulesMember: [],
            readu: false, //
            display: [],
            page: 0,
            dispReady: true
        }
    },
    props: {
        projects: {
            type: Array
        },
        isMember: {
            type: Array
        }
    },
    created () {
        this.showProjectList();
        this.ready = true;

        console.log("PL");
        console.log(this.isMember);
    },
    components: {
        projectTile,
        pagination
    },
    methods: {
        showProjectCreation () {
            this.$emit('showCreationForm');
        },
        showProjectList () {
            console.log("PROJS")
            console.log(this.projects);
            this.projects.forEach(p => {
                this.projectsArr.push(p);
            });
            this.isMember.forEach(m => {
                this.isModulesMember.push(m);
            });
        },
        openDetail (event1, event2) {
            alert("indice che passa da project list verso la home: "+event2)
            this.$emit('detail', event1, event2);
        },
        dispatchedPagination: function (toDisplay) {
            this.dispReady = false;
            //finding actual page
            //alert(this.projectsArr.indexOf(toDisplay[0]))
            var tmp = this.projectsArr.indexOf(toDisplay[0]);
            this.page = tmp;


            //console.log(this.isModulesMember);
            //console.log(tmp+2)
            //console.log(this.isModulesMember[tmp+2])
            //alert(this.isModulesMember[2+tmp])
            console.log("çççççççççççççççççççççççççç")


            this.display = toDisplay;

            this.dispReady = true;
        },
        updateProjectsList () {
            this.$emit('projectDeleted');
        }
    }
};
</script>