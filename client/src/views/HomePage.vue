<template>
  <div class="container-fluid">
    <navbar :firstDropdownItem="firstDropdownItem"></navbar>
    
    <div class="row mt-5">
			<div class="col-12 col-sm-12 col-md-3 col-xl-3 mb-5">
                <projectsList v-if="projectsReady" @showCreationForm="showProjectCreationForm" @detail="showProjectDetail" @projectDeleted="deleteProject" :projects="projectsArr" :isMember="isMember"></projectsList>
                <img v-show="!projectsReady" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
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
    data () {
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
    created () {
        this.init();
    },
    methods: {
        addProject () {
            this.getProjectList();
        },
        deleteProject () {
            this.getProjectList();
            this.showDetail = false;
        },
        showUserName () {
            this.username = JSON.parse(localStorage.getItem('user')).email;
        },
        getProjectList() {
            this.projectsReady = false;
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.get(localStorage.getItem('path') + '/projects/0/' + this.username/*, json*/, tokenJson).then(function(response) {
                console.log(response.body);
                this.projectsArr = response.body;//lo memorizzo nei data di questa view per poi poterlo passare al componente container (tramite props) che lo userà per creare i componenti tiles
                //alert("prova");//l'ho messo per farti vedere che viene mostrata l'iconcina di cariacmento(in futuro metteremo una iconcina più bella, ovviamente sarà un componente )
                
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
                //mostrare errore nel componente contenitore dei tile magari con una scritta rossa
                this.projectsReady = true;//?????? gestiamo bene la logica
            });

            
        },
        showProjectCreationForm () {
            this.creating = true;
            this.hideProjectDetail();
        },
        hideProjectCreationForm () {
            this.creating = false;
        },
        showProjectDetail (event1, event2) {//event2 dovrebbe essere l'indice di isMember così da passarlo correttamente al detail
            //alert("aggiornamento project and member detail"+ event1 +" "+ event2+ "  e is member con indice giusto: "+ this.isMember[event2])
            
            this.projectDetail = event1;
            this.projectIndex = event2;
            console.log("EVENT2");
            console.log(this.projectIndex);

            console.log("____________________________")
            console.log(this.projectIndex)
            console.log(this.isMember);
            console.log(this.isMember[this.projectIndex])


            this.showDetail = true;
            this.hideProjectCreationForm()
        },
        hideProjectDetail () {
            this.showDetail = false;
        },
        logout () {
            this.$router.push('/login');
        },
        init () {
            //this.getNotificationsNumber();
            this.showUserName();
            this.getProjectList();
        },
        openPersonalArea () {
            this.$router.push('/personalarea');
        },
        getNotificationsNumber() {
            this.notificationsReady = false;
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            //TODO
            this.$http.get(localStorage.getItem('path') + '/projects/0/' + this.username/*, json*/, tokenJson).then(function(response) {
                console.log(response.body);
                localStorage.setItem('notifications', response.body);
                this.notificationsNumber = response.body;

                this.notificationsReady = true;
            }, (err) => {
                console.log(err.body);
            });
        }
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
 
/*
@media (max-width: 576px) {
    .detail {
      padding: 0px !important;
      margin: 0px !important;
    }
}
*/

</style>