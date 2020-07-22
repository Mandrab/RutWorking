<template>
    <div>
        <div class="row">
            <div class="col-6 col-sm-6 col-md-6 col-xl-6">
                {{ item.assignee }}
            </div>
            <div v-if="isModuleChief" class="col-6 col-sm-6 col-md-6 col-xl-6">
                <button class="btn btn-primary">D</button>
            </div>
        </div>
        <div class="row text-left">
            {{ item.taskDescription }}
        </div>
        <div class="row">
            <div v-if="!isLeftArrowDisabled" class="">
                <button class="btn btn-primary" @click="moveToPreviousStage">L</button>
            </div>
            <div v-if="!isRightArrowDisabled" class="">
                <button class="btn btn-primary" @click="moveToNextStage">R</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
          username,
          isProjectChief,
          isModuleChief,
          isLeftArrowDisabled,
          isRightArrowDisabled,
          status
        }
    },
    created () {
        console.log(this.item);
        this.init();
    },
    props: {
        item: {
            type: Object
        }
    },
    methods: {
        init () {
            this.username = JSON.parse(localStorage.getItem('user')).email;
        },
        moveToNextStage () {

        },
        moveToPreviousStage () {

        },
    }
};
</script>

<style scoped>
.list-group-item:hover {
    background-color: lightgray;
}
</style>