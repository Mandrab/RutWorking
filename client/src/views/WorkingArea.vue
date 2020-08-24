<template>
  <div class="container-fluid">
    <nav class="navbar navbar-expand-lg navbar-light bg-light rounded">
        <a class="col-6 col-sm-6 col-md-6 col-xl-6 navbar-brand text-left mx-0 p-1" href="#" @click="openHomePage">RutWorking</a>
        <!-- collapse w-100 order-3 dual-collapse2 -->
        <div class="col-6 col-sm-6 col-md-6 col-xl-6 mx-0 p-0">
            <b-dropdown class="d-none d-sm-block d-md-block d-lg-block float-right" id="dropdown-options" right variant="light">
                <template v-slot:button-content>
                    {{ username }}
                </template>
                <b-dropdown-item @click="openPersonalArea">Personal Area</b-dropdown-item>
                <b-dropdown-item @click="logout">Logout</b-dropdown-item>
            </b-dropdown>

            <b-dropdown class="d-sm-none float-right" id="dropdown-options" right variant="light">
                <template v-slot:button-content>
                    ...
                </template>
                <b-dropdown-header disabled> {{ username }} </b-dropdown-header>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item @click="openPersonalArea">Personal Area</b-dropdown-item>
                
                <b-dropdown-item @click="logout">Logout</b-dropdown-item>
            </b-dropdown>
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
        
    </div>
    <div v-else>
        <!-- inserire img di loading (attraverso componente) -->
    </div>

    <div class="row">
        <div class="col-sm-12 col-md-12 col-xl-12">
            <kanban :stages="statuses" :module="module"></kanban>
        </div>
        <div >
            <chat :module="module"></chat>
        </div>
    </div>

    

    
  </div>
</template>


<script>
import kanban from '../components/Kanban.vue';
import chat from '../components/Chat.vue';

export default {
    data () {
        return {
            username: '',
            showDropdownMenu: false,
            module: {},
            moduleReady: false,
            deadlineColor: 'black',
            statuses: ['TO-DO', 'ASSIGNED', 'IN-PROGRESS', 'DONE'],
            blocks: [] //
        }
    },
    components: {
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
            var date = new Date(this.module.deadline);
            var weekLater = new Date();
            var today = new Date();
            weekLater.setDate(date.getDate()+7);

            if (date >= today && date <= weekLater ) {
                this.deadlineColor = 'orange';
            }
            else if(date < today) {
                this.deadlineColor = 'red';
            } else { 
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

