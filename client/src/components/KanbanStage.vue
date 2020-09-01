<template>
    <div v-if="ready" class="container pt-3">
        <taskTile v-for="(tile, index) in stageTasks" :item="tile" :key="index" @updateTask="updateTask" @showConfirmationModal="showConfirmationModal" :isModuleChief="ic"></taskTile>
        <div class="mb-3" style="color: gray;" v-if="stageTasks.length == 0"> Empty </div>
        <button v-if="showButton()" @click="addTask" class="btn btn-primary"><font-awesome-icon icon="plus"/></button>
    </div>
</template>

<script>
import taskTile from '../components/TaskTile.vue';

export default {
    data() {
        return {
            stageTasks: [],
            createButton: false,
            userInForm: false,
            ready: false,
            ic:false
        }
    },
    components: {
       taskTile
    },
    props: {
        title: {
            type: String,
            required: true
        },
        tasks: {
          type: Array
        },
        isModuleChief: {
            type: Boolean
        }
    },
    methods: {
        init() {
            this.ready = false;
            this.stageTasks = this.tasks.slice();
            this.ready = true;
            this.ic = this.isModuleChief;
            
        },
        addTask(){
            this.userInForm = false;
            if (this.title == "ASSIGNED") {
                this.userInForm = true;
            }
            this.$emit('addTask', this.userInForm);
        },
        updateTask() {
            this.$emit('updateTask');
        },
        showButton() {
            return (this.ready && this.createButton && this.isModuleChief);
        },
        showConfirmationModal() {
            this.$emit('showConfirmationModal');
        },
        prova2() {
            alert("DOPO");
        }
    },
    mounted() {
        if (this.title == "TO-DO" || this.title == "ASSIGNED") {
            this.createButton = true;
        }
        this.init();
    }
};
</script>
