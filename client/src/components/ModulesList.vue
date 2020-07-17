<template>
    <div class="modules">
        <ul class="list-group">
            <moduleTile v-for="(tile, index) in modulesArr" :projectInfo="projectInfo" :item="tile" :key="index" @openModule="openModule" @refreshModulesList="refreshModulesList"></moduleTile>
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
        projectInfo: {
            type: Object
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
            console.log("modules");
            console.log(this.modules);
            console.log("modulesArr");
            console.log(this.modulesArr);
        },
        openModule (event) {
            this.$emit('clickModule', event);
        },
        refreshModulesList (event) {
            this.$emit('refreshModulesList', event);
        }
        
    }
};
</script>