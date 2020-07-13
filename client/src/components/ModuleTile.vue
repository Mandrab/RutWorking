<template>
    <div class="mt-2 mb-2">
        <li class="list-group-item" @click="open">
            <div>
                <div class="row">
                    <div class="col-12 col-sm-9 col-md-9 col-xl-9 text-left font-weight-bold h5 p-3 mb-0">
                        {{ item.name }}
                    </div>
                    <div v-if="ready" class="col-12 col-sm-3 col-md-3 col-xl-3 float-right small p-3" v-bind:style="{ color: deadlineColor }">
                        Deadline: {{ new Date(item.deadline).getDate() }}/{{ new Date(item.deadline).getMonth() + 1 }}/{{ new Date(item.deadline).getFullYear() }}
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 col-sm-12 col-md-12 col-xl-12 text-left">
                        {{ item.description }}
                    </div>
                    
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