<template>
    <div class="mt-2 mb-2">
        <li class="list-group-item" @click="open">
            <div>
                <div v-if="isProjectChief" class="row">
                    <div class="col-10 col-sm-8 col-md-8 col-xl-8 text-left font-weight-bold h5 pb-0 mb-0">
                        {{ item.name }}
                    </div>
                    <div class="col-2 col-sm-1 col-md-1 col-xl-1">
                        <button class="btn btn-primary" @click="deleteModule">D</button>
                    </div>
                    <div v-if="ready" class="col-12 col-sm-3 col-md-3 col-xl-3 text-right float-right small pb-2" v-bind:style="{ color: deadlineColor }">
                        Deadline: {{ new Date(item.deadline).getDate() }}/{{ new Date(item.deadline).getMonth() + 1 }}/{{ new Date(item.deadline).getFullYear() }}
                    </div>
                </div>

                <div v-if="!isProjectChief" class="row">
                    <div class="col-12 col-sm-9 col-md-9 col-xl-9 text-left font-weight-bold h5 pb-0 mb-0">
                        {{ item.name }}
                    </div>
                    <div v-if="ready" class="col-12 col-sm-3 col-md-3 col-xl-3 text-right float-right small pb-2" v-bind:style="{ color: deadlineColor }">
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
            deadlineColor: 'black',
            developers: [],
            developersReady: false
        }
    },
    created () {
        console.log(this.item);
        this.init();
        this.checkDeadline();
    },
    props: {
        item: {
            type: Object
        },
        projectName: {
            type: String
        }
    },
    watch: {
        item: function () {
            this.checkDeadline();
        }
    },
    methods: {
        init () {
            this.developersReady = false;
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            console.log(localStorage.getItem('path') + '/projects/' + this.projectName + '/modules/' + this.item.name);
            this.$http.get(localStorage.getItem('path') + '/projects/' + this.projectName + '/modules/' + this.item.name, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                    res = JSON.parse(res);
                } catch (error) {console.log(error)}
                console.log(res);
                this.developers = res.developers;
                this.developersReady = true;

                console.log("CHIEF" + this.item.chief);
                
            }, (err) => {
                alert("err");
                alert(err.body);
                console.log(err.body);
                this.developersReady = false;
            });
        },
        checkDeadline () {
            this.ready = false;
            var date = new Date(this.item.deadline);
            var weekAgo = new Date();
            var today = new Date();
            weekAgo.setDate(today.getDate()+7);
            if (date <= today && date >= weekAgo ) {
                this.deadlineColor = 'orange';
            }
            else if(date < today) {
                this.deadlineColor = 'red';
            } else { 
                this.deadlineColor = 'green';
            }
            this.ready = true;
        },
        open () {
            this.$emit('openModule', this.item);
        },
        deleteModule () {
            
        }
    }
};
</script>

<style scoped>
.list-group-item:hover {
    background-color: lightgray;
}
</style>