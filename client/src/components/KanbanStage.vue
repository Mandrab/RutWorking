<template>
    <div class="container">
        {{ title }}
        <taskTile v-for="(tile, index) in stageTasks" :item="tile" :key="index" @updateTask="updateTask"></taskTile>
    </div>

</template>

<script>
import taskTile from '../components/TaskTile.vue';

export default {
    data () {
        return {
            stageTasks: []
        }
    },
    components: {
       taskTile
    },
    computed: {
      
    },
    mounted() {
      
    },
    created () {
        console.log(this.tasks);
        this.init();
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
        }
    }
};
</script>
