<template>
    <div class="modules">
        <ul class="list-group">
            <moduleTile v-for="(tile, index) in modulesArr" :projectInfo="projectInfo" :isMember="isMember[index]" :item="tile" :key="index" @openModule="openModule" @refreshModulesList="refreshModulesList"></moduleTile>
		</ul>
    </div>
</template>

<script>
import moduleTile from '../components/ModuleTile.vue'

export default {
    data () {
        return {
            modulesArr: [],
            isMember: []
        }
    },
    props: {
        modules: {
            type: Array
        },
        projectInfo: {
            type: Object
        },
        isModulesMember: {
            type: Array
        }
    },
    created () {
        console.log(this.modules);
        this.showModule();

        this.isMember = this.isModulesMember;
        console.log("LIST");
        console.log(this.isMember);
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