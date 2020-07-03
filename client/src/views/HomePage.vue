<template>
  <div class="container-fluid">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="#">RutWorking</a>
<!--
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		</button>
-->
        <div class="navbar-collapse collapse w-100 order-3 dual-collapse2">
            <ul class="navbar-nav ml-auto">
                <li class="nav-item dropdown">
				    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				        {{ username }}
				    </a>
				<div class="dropdown-menu" aria-labelledby="navbarDropdown">
				  <a class="dropdown-item" href="#">Profile settings</a>
				  <div class="dropdown-divider"></div>
				  <a class="dropdown-item" href="#">Logout</a>
				</div>
			    </li>
            </ul>
        </div>
    </nav>

    <div class="row mt-5"></div>

    <div class="row">
			<div class="col-12 col-md-4 col-xl-3">
				<aside>
					<ul class="list-group">
					  <li class="list-group-item">My Projects
                        <button @click="showProjectCreation" class="btn btn-primary" :disabled="creating">+</button>
					  </li>
                      <li class="list-group-item">Proj1</li>
					  <li class="list-group-item">Proj2</li>
					  <li class="list-group-item">Proj3</li>
					</ul>
				</aside>
			</div>
			<div class="col-12 col-md-8 col-xl-9">
				<div>
                    <createProjectForm v-if="creating" @done="hideProjectCreationForm"></createProjectForm>
				</div>
			</div>
	</div>
  </div>
</template>


<script>
import createProjectForm from '../components/CreateProjectForm.vue';

export default {
    data () {
        return {
            username: '',
            password: '',
            submitted: false,
            creating: false
        }
    },
    components: {
        createProjectForm
    },
    created () {
        this.showUserName();
    },
    methods: {
        showUserName () {
            this.username = JSON.parse(localStorage.getItem('user')).email;
        },
        showProjectCreation () {
            this.creating = true;
        },
        hideProjectCreationForm () {
            this.creating = false;
        },
        logout () {
            this.$route.push('/login');
        }
    }
};
</script>