<template>
    <li class="list-group-item">
        <div @click="open">
            <div class="row font-weight-bold h5">
                {{ item.name }}
            </div>
            <div v-if="ready" class="row float-right small" v-bind:style="{ color: deadlineColor }">
                {{ new Date(item.deadline).getDate() }}/{{ new Date(item.deadline).getMonth() }}/{{ new Date(item.deadline).getFullYear() }}
            </div>
            <div>
                {{ item.description }}
            </div>
        </div>
    </li>
</template>

<script>
export default {
    data () {
        return {
            ready: false,
            deadlineColor: 'black'
        }
    },
    created () {
        console.log(this.item);
        this.checkDeadline();
    },
    props: {
        item: {
            type: Object
        }
    },
    methods: {
        checkDeadline () {
            var date = new Date(this.item.deadline);
            var today = new Date();
            if (date.getFullYear() < today.getFullYear() || date.getMonth() < today.getMonth() || date.getDate() < today.getDate()) {
                this.deadlineColor = 'red';
            } else { // fare l'intermedio giallo
                this.deadlineColor = 'green';
            }
            this.ready = true;
        },
        open () {
            this.$emit('openModule', this.item);
        }
    }
};
</script>

<style scoped>
.list-group-item:hover {
    background-color: lightgray;
}
</style>