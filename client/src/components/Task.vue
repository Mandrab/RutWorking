<template>
    <div>
        <div class="row">
            <div class="col-6 col-sm-6 col-md-6 col-xl-6">
                {{ username }}
            </div>
            <div v-if="isModuleChief" class="col-6 col-sm-6 col-md-6 col-xl-6">
                <button class="btn btn-primary">D</button>
            </div>
        </div>
        <div class="row text-left">
            {{ description }}
        </div>
        <div class="row">
            <div v-if="!isLeftArrowDisabled">
                <button class="btn btn-primary" @click="moveToPreviousStage">L</button>
            </div>
            <div v-if="!isRightArrowDisabled">
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
          isRightArrowDisabled
        }
    },
    created () {
        this.init();
    },
    props: {

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