<template>
  <div class="container-fluid" style="padding-bottom: 60px;">
    <navbar :firstDropdownItem="firstDropdownItem"></navbar>
    
    <div class="row mt-5">
        <div class="col-12 col-sm-12 col-md-3 col-xl-3 mb-5">
            <projectsList v-if="projectsReady" @showCreationForm="showProjectCreationForm" @detail="showProjectDetail" @projectDeleted="deleteProject" :projects="projectsArr" :isMember="isMember"></projectsList>
            <font-awesome-icon v-if="!projectsReady" style="color: gray;" icon="spinner" pulse size="2x"/>
        </div>
        <div class="col-12 col-sm-12 col-md-9 col-xl-9">
            <div>
                <createProjectForm v-if="creating" @projectAdded="addProject" @hide="hideProjectCreationForm"></createProjectForm>
            </div>
            <div class="detail bg-light p-4 rounded" v-if="showDetail">
                <projectDetail v-if="showDetail && projectsReady" :project="projectDetail" :isMember="isMember[projectIndex]" @getModulesInfo="getProjectList"></projectDetail>
            </div>
            <div class="default-msg" v-if="!creating && !showDetail">
                <h2>Select a project</h2>
            </div>
        </div>
	</div>
  </div>
</template>

<script>
import navbar from '../components/Navbar.vue';
import projectsList from '../components/ProjectsList.vue'
import createProjectForm from '../components/CreateProjectForm.vue';
import projectDetail from '../components/ProjectDetail.vue';

export default {
    data() {
        return {
            username: '',
            firstDropdownItem: 'personal-area',
            submitted: false,
            creating: false,
            showDetail: false,
            projectsReady: false,
            projectsArr: [],
            isMember: [],
            projectDetail: {},
            projectIndex: 0,
        }
    },
    components: {
        navbar,
        projectsList,
        createProjectForm,
        projectDetail
    },
    methods: {
        init() {
            this.showUserName();
            this.getProjectList();
        },
        showUserName() {
            this.username = JSON.parse(localStorage.getItem('user')).email;
        },
        getProjectList() {
            this.projectsReady = false;
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.get(localStorage.getItem('path') + '/projects/0/' + this.username, tokenJson).then(function(response) {
                this.projectsArr = response.body;
                for (var i = 0; i < this.projectsArr.length; i++) {
                    if (this.projectsArr[i].modules.length != 0) {
                        var isModulesMember = [];
                        for (var j = 0; j < this.projectsArr[i].modules.length; j++) {
                            isModulesMember.push(this.projectsArr[i].modules[j].member);
                        }
                        this.isMember[i] = isModulesMember;
                    } else {
                        this.isMember[i] = [];
                    }
                }
                this.projectsReady = true;
            }, (err) => {
                console.log(err.body);
                this.projectsReady = true;
            });
        },
        addProject() {
            this.getProjectList();
        },
        deleteProject() {
            this.getProjectList();
            this.showDetail = false;
        },
        showProjectCreationForm() {
            this.creating = true;
            this.hideProjectDetail();
        },
        hideProjectCreationForm() {
            this.creating = false;
        },
        showProjectDetail(event1, event2) {
            this.projectDetail = event1;
            this.projectIndex = event2;
            this.showDetail = true;
            this.hideProjectCreationForm()
        },
        hideProjectDetail() {
            this.showDetail = false;
        },
        getNotificationsNumber() {
            this.notificationsReady = false;
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.get(localStorage.getItem('path') + '/projects/0/' + this.username, tokenJson).then(function(response) {
                localStorage.removeItem('notifications');
                localStorage.setItem('notifications', response.body);
                this.notificationsNumber = response.body;
                this.notificationsReady = true;
            }, (err) => {
                console.log(err.body);
            });
        },
        openPersonalArea() {
            this.$router.push('/personalarea');
        },
        logout() {
            this.$router.push('/login');
        }
    },
    created() {
        this.init();
    }
};
</script>

<style scoped>
.default-msg {
    padding: 20% 0%;
}

.b-dropdown:hover {
    background-color: #F8F9FA;
}
</style>