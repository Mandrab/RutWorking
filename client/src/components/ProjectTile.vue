<template>
    <li class="list-group-item" @click="open"> 
        <div class="row font-weight-bold h5">
            {{ item.name }}
        </div>
        <div v-if="ready" class="row float-right small" v-bind:style="{ color: deadlineColor }">
            {{ new Date(item.deadline).getDate() }}/{{ new Date(item.deadline).getMonth() + 1 }}/{{ new Date(item.deadline).getFullYear() }}
        </div>
    </li>		
</template>

<script>
export default {
    watch: {
        item: function () {
            this.checkDeadline();
        }
    },
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
            var weekAgo = new Date();
            var today = new Date();
            weekAgo.setDate(date.getDate()+7);
            if (date <= today && date >= weekAgo ) {
                this.deadlineColor = 'orange';
            }
            else if(date < weekAgo) {
                this.deadlineColor = 'red';
            } else { 
                this.deadlineColor = 'green';
            }
            this.ready = true;
        },
        open () {
            this.$emit('openDetail', this.item);
        }
    }
};
</script>

<style scoped>
.list-group-item:hover {
    background-color: lightgray;
}
</style>