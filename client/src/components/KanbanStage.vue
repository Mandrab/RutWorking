<template>
    <div v-if="ready" class="container">
        {{ title }}
        <taskTile v-for="(tile, index) in stageTasks" :item="tile" :key="index" @updateTask="updateTask"></taskTile>
        <div v-if="stageTasks.length == 0"> Empty </div>
        <button v-if="showButton()" @click="addTask" class="btn btn-primary">+</button>
        {{ isModuleChief }}
        <!--<createTaskModal v-if="showModalFormTask" :insertUser="userInForm" @closeModal="hideModalTaskForm"></createTaskModal>-->
    </div>
</template>

<script>
import taskTile from '../components/TaskTile.vue';
//import createTaskModal from '../components/CreateTaskModal.vue';

export default {
    data () {
        return {
            stageTasks: [],
            createButton: false,
            userInForm: false,
            isModuleChief: false,
            ready: false
            //showModalFormTask: false
        }
    },
    components: {
       taskTile,
       //createTaskModal
    },
    computed: {
      
    },
    mounted() {
        if(this.title == "TO-DO" || this.title == "ASSIGNED")
            this.createButton = true;
        console.log(this.tasks);
        this.init();
    },
    created () {
        
    },
    props: {
        title: {
            type: String,
            required: true
        },
        tasks: {
          type: Array
          //required: true,
        }
    },
    watch: {
        /*isModuleChief: function () {
            alert(this.isModuleChief);
        }*/
        
    },
    methods: {
        init () {
            this.ready = false;
            /*this.tasks.forEach(t => {
                this.stageTasks.push(t);
            });*/
            this.stageTasks = this.tasks.slice();
            console.log("stageTasks");
            console.log(this.stageTasks);


            var value = localStorage.getItem('isModuleChief');
            if (value == "true"){
                
            this.isModuleChief = true;
            }
            this.isModuleChief = false;
            this.ready = true;
        },
        updateTask () {
            console.log("ENTROOOOO")
            this.$emit('updateTask');
        },
        addTask (/*event*/){
            
            this.userInForm = false;
            //if(this.title == "TO-DO" )
            //showModalTaskForm();
            if(this.title == "ASSIGNED")
            this.userInForm = true;
            
            this.$emit('addTask',this.userInForm);


            //this.showModalTaskForm();
        },
        showButton(){
            alert("ready - createbutton - ischief: "+this.ready +" " +this.createButton +" "+ this.isModuleChief  +"   title:"+ this.title)
            if( this.ready && this.createButton && this.isModuleChief )
                return true;
            else
                return false;

            
        }
        /*showModalTaskForm(){
            this.showModalFormTask = true;
        },
        hideModalTaskForm(){
            this.showModalFormTask = false;
        }*/
    }
};
</script>
