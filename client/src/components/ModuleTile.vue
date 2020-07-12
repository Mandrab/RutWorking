<template>
    <div class="mt-2 mb-2">
        <li class="list-group-item" @click="open">
        <div>
            <div class="row font-weight-bold h5">
                {{ item.name }}
            </div>
            <div v-if="ready" class="col-sm-2 row float-right small" v-bind:style="{ color: deadlineColor }">
                {{ new Date(item.deadline).getDate() }}/{{ new Date(item.deadline).getMonth() + 1 }}/{{ new Date(item.deadline).getFullYear() }}
            </div>
            <div class="col-sm-10 text-left pl-0">
                {{ item.description }}
            </div>
        </div>
    </li>
    </div>
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
            this.ready = false;
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