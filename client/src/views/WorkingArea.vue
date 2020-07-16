<template>
  <div class="container-fluid">
    <nav class="navbar navbar-expand-lg navbar-light bg-light rounded">
        <a class="col-12 col-sm-6 col-md-6 col-xl-6 navbar-brand text-left mx-0" href="#" @click="openHomePage">RutWorking</a>
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

    <div v-if="moduleReady" class="mt-4"> 
        <div class="row pb-1">
            <div class="col-12 col-sm-8 col-md-8 col-xl-8 text-left">
                <h2> <b>[{{ module.project }}]</b> {{ module.name }} </h2>
            </div>
            <div class="col-12 col-sm-4 col-md-4 col-xl-4 text-right" v-bind:style="{ color: deadlineColor }">
                Deadline: {{ new Date(module.deadline).getDate() }}/{{ new Date(module.deadline).getMonth() + 1}}/{{ new Date(module.deadline).getFullYear() }}
            </div>
        </div>

        <div class="row px-3">
            <div class="float-lg-left text-left">
                {{ module.description }}
            </div>
        </div>
        
        {{ module.chiefID }}
    </div>
    <div v-else>
        <!-- inserire img di loading (attraverso componente) -->
    </div>

    <div class="row">
        <div class="col-sm-8 col-md-8 col-xl-8">
            <kanban></kanban>
        </div>
        <div class="col-sm-4 col-md-4 col-xl-4">
            <chat></chat>
        </div>
    </div>

    

    
  </div>
</template>


<script>
import dropdownMenu from '../components/DropdownMenu.vue';
import kanban from '../components/Kanban.vue';
import chat from '../components/Chat.vue';

export default {
    data () {
        return {
            username: '',
            showDropdownMenu: false,
            module: {},
            moduleReady: false,
            deadlineColor: 'black'
        }
    },
    components: {
        dropdownMenu,
        kanban,
        chat
    },
    created () {
        this.init();
        this.checkDeadline();
    },
    methods: {
        showUserName () {
            this.username = JSON.parse(localStorage.getItem('user')).email;
        },
        logout () {
            this.$router.push('/login');
        },
        init () {
            this.showUserName();
            this.module = JSON.parse(localStorage.getItem('module'));
            this.moduleReady = true;
            console.log(this.module);
        },
        checkDeadline () {
            this.moduleReady = false;
            var date = new Date(module.deadline);
            var weekAgo = new Date();
            var today = new Date();
            weekAgo.setDate(today.getDate()-7);
            if (date <= today && date >= weekAgo ) {
                this.deadlineColor = 'orange';
            }
            else if (date < weekAgo) {
                this.deadlineColor = 'red';
            } else { // fare l'intermedio giallo
                this.deadlineColor = 'green';
            }
            this.moduleReady = true;
        },
        openPersonalArea () {
            this.$router.push('/personalarea');
        },
        openHomePage () {
            this.$router.push('/');
        }
    }
};
</script>

