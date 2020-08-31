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
    data() {
        return {
            modulesArr: [],
            isMember: []
        }
    },
    components: {
        moduleTile
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
    methods: {
        showModule() {
            this.modules.forEach(p => {
                this.modulesArr.push(p);
            });
        },
        openModule(event) {
            this.$emit('clickModule', event);
        },
        refreshModulesList(event) {
            this.$emit('refreshModulesList', event);
        }
        
    },
    created() {
        this.showModule();
        this.isMember = this.isModulesMember;
    }
};
</script>