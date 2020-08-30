<template>
  <div class="container-fluid">
    <navbar :firstDropdownItem="firstDropdownItem"></navbar>

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
        <font-awesome-icon icon="spinner" spin size="4x"/>
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
import navbar from '../components/Navbar.vue';
import kanban from '../components/Kanban.vue';
import chat from '../components/Chat.vue';

export default {
    data () {
        return {
            username: '',
            firstDropdownItem: 'personal-area',
            module: {},
            moduleReady: false,
            deadlineColor: 'black',
            statuses: ['TO-DO', 'ASSIGNED', 'IN-PROGRESS', 'DONE']
        }
    },
    components: {
        navbar,
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

