<template>
    <div class="modules">
        <ul class="list-group">
            <moduleTile v-for="(tile, index) in modulesArr" :projectName="projectName" :item="tile" :key="index" @openModule="openModule"></moduleTile>
		</ul>
    </div>
</template>

<script>
import moduleTile from '../components/ModuleTile.vue'

export default {
    data () {
        return {
            modulesArr: []
        }
    },
    props: {
        modules: {
            type: Array
        },
        projectName: {
            type: String
        }
    },
    created () {
        console.log(this.modules);
        this.showModule();
    },
    components: {
        moduleTile
    },
    methods: {
        showModule () {
            console.log(this.modules);
            this.modules.forEach(p => {
                this.modulesArr.push(p);
            });
        },
        openModule (event) {
            this.$emit('clickModule', event);
        }
        
    }
};
</script>