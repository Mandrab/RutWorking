<template>
  <div class="container-fluid">
    <nav class="navbar navbar-expand-lg navbar-light bg-light rounded">
        <a class="col-12 col-sm-6 col-md-6 col-xl-6 navbar-brand text-left mx-0" href="#">RutWorking</a>
        <!-- collapse w-100 order-3 dual-collapse2 -->
        <div class="col-12 col-sm-6 col-md-6 col-xl-6 mx-0 text-right navbar-collapse">
            <dropdownMenu class="navbar-nav ml-auto" v-model="showDropdownMenu" :right="true" :hover="true">
                <a class="nav-link dropdown-toggle" v-bind:style="{ color: 'black' }">
                    {{ username }}
                </a>
                <div slot="dropdown">
                    <a class="dropdown-item" href="#" @click="openPersonalArea">Personal Area</a>
                    <a class="dropdown-item" href="#" @click="logout">Logout</a>
                </div>
            </dropdownMenu>
        </div>
    </nav>

    <div class="row mt-5">
			<div class="col-12 col-sm-12 col-md-3 col-xl-3 mb-5">
                <projectsList v-if="projectsReady" @showCreationForm="showProjectCreationForm" @detail="showProjectDetail" :projects="projectsArr"></projectsList>
                <img v-show="!projectsReady" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
			</div>
			<div class="col-12 col-sm-12 col-md-9 col-xl-9">
				<div>
                    <createProjectForm v-if="creating" @projectAdded="addProject" @hide="hideProjectCreationForm"></createProjectForm>
				</div>
                <div class="detail bg-light p-4 rounded" v-if="showDetail">
                    <projectDetail v-if="showDetail" :project="projectDetail"></projectDetail>
				</div>
                <div class="default-msg" v-if="!creating && !showDetail">
                    <h2>Select a project</h2>
                </div>
			</div>
	</div>
  </div>
</template>


<script>
import dropdownMenu from '../components/DropdownMenu.vue';
import projectsList from '../components/ProjectsList.vue'
import createProjectForm from '../components/CreateProjectForm.vue';
import projectDetail from '../components/ProjectDetail.vue';

export default {
    data () {
        return {
            username: '',
            password: '',
            submitted: false,
            creating: false,
            showDetail: false,
            projectsReady: false,
            projectsArr: [],
            projectDetail: {},
            showDropdownMenu: false,
        }
    },
    components: {
        dropdownMenu,
        projectsList,
        createProjectForm,
        projectDetail
    },
    created () {
        this.init();
    },
    methods: {
        addProject () {
            alert("progetto aggiunto mi accingo a refreshare");
            this.getProjectList();
        },
        showUserName () {
            this.username = JSON.parse(localStorage.getItem('user')).email;
        },
        getProjectList() {
            this.projectsReady = false;
            var vm = this;
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            //var json = { "user": this.username }//in realta la mail??? attenzione ai nomi
            vm.$http.get(localStorage.getItem('path') + '/projects/'/*, json*/, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                    res = JSON.parse(res);
                } catch (error) {console.log(error)}
                this.projectsArr = res;//lo memorizzo nei data di questa view per poi poterlo passare al componente container (tramite props) che lo userà per creare i componenti tiles
                //alert("prova");//l'ho messo per farti vedere che viene mostrata l'iconcina di cariacmento(in futuro metteremo una iconcina più bella, ovviamente sarà un componente )
                this.projectsReady = true;
            }, (err) => {
                alert(err);
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
        showProjectDetail (event) {
            this.projectDetail = event;
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
            this.showUserName();
            this.getProjectList();
        },
        openPersonalArea () {
            this.$router.push('/personalarea');
        }
    }
};
</script>

<style scoped>
.default-msg {
    padding: 20% 0%;

}
</style>