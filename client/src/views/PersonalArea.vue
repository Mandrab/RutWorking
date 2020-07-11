<template>
  <div class="container-fluid">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="#" @click="openHomePage">RutWorking</a>
        
        <div class="navbar-collapse collapse w-100 order-3 dual-collapse2">
            <dropdownMenu class="navbar-nav ml-auto" v-model="showDropdownMenu" :right="true" :hover="true">
                <a class="nav-link dropdown-toggle">
                    {{ username }}
                </a>
                <div slot="dropdown">
                    <a class="dropdown-item" href="#" @click="openHomePage">Home Page</a>
                    <a class="dropdown-item" href="#" @click="logout">Logout</a>
                </div>
            </dropdownMenu>
        </div>
    </nav>

    <div class="row mt-5"></div>

    <div class="bg-light rounded">
            <div class="row">
		<div class="col-sm-6 offset-sm-3">
            <h2>User Info</h2>
            <div>
        <a> Name: {{ name }} </a>
    </div>
    <div>
        <a> Surname: {{ surname }} </a>
    </div>
    <div>
        <a> E-mail: {{ username }} </a>
    </div>
    <div>
        <a> Role: {{ role }} </a>
    </div>
		</div>
	</div>

    <div class="row mt-5"></div>

    <div class="row">
		<div class="col-sm-6 offset-sm-3">
            <h2>Access Management</h2>
            <button @click="changePassword" class="btn btn-primary">Change password</button>
		</div>	
	</div>

    <div class="row mt-5"></div>

    <div class="row">
		<div class="col-sm-6 offset-sm-3">
            <h2>Statistics</h2>
		</div>
			
	</div>

        
    </div>


  </div>
</template>


<script>
import dropdownMenu from '../components/DropdownMenu.vue';

export default {
    data () {
        return {
            name: '',
            surname: '',
            username: '',
            role: '',
            showDropdownMenu: false
        }
    },
    components: {
        dropdownMenu
    },
    created () {
        this.init();
    },
    methods: {
        init () {
            this.username = JSON.parse(localStorage.getItem('user')).email;

            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            this.$http.get(localStorage.getItem('path') + '/user/' + this.username/*, json*/, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire try catch in futuro
                    res = JSON.parse(res);
                } catch (error) {
                    console.log(error);
                }
                this.name = res.name;
                this.surname = res.surname;
                this.role = res.role;
            }, (err) => {
                alert(err);
                console.log(err.body);
                //mostrare errore nel componente contenitore dei tile magari con una scritta rossa
            });
            
        },
        changePassword () {

        },
        openHomePage () {
            this.$router.push('/');
        },
        logout () {
            this.$router.push('/login');
        }
    }
};
</script>