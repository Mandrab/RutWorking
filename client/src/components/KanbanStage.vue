<template>
    <div class="container">
        {{ title }}
        <taskTile v-for="(tile, index) in stageTasks" :item="tile" :key="index" @updateTask="updateTask"></taskTile>
        <div v-if="stageTasks.length == 0"> Empty </div>
        <button v-if="createButton" @click="addTask" class="btn btn-primary">+</button>


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
        
    },
    methods: {
        init () {
            this.tasks.forEach(t => {
                this.stageTasks.push(t);
            });
            console.log("stageTasks");
            console.log(this.stageTasks);
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
        /*showModalTaskForm(){
            this.showModalFormTask = true;
        },
        hideModalTaskForm(){
            this.showModalFormTask = false;
        }*/
    }
};
</script>
