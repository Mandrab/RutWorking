<template>
    <div class="mt-2 mb-2">
        <li class="list-group-item" @click.stop="openModule">
            <div>
                <div class="row">
                    <div class="col-12 col-sm-9 col-md-9 col-xl-9 text-left font-weight-bold h5 pb-0 mb-0">
                        {{ item.name }}
                    </div>
                    <div v-if="ready" class="col-12 col-sm-3 col-md-3 col-xl-3 text-right float-right small pb-2" v-bind:style="{ color: deadlineColor }">
                        Deadline: {{ new Date(item.deadline).getDate() }}/{{ new Date(item.deadline).getMonth() + 1 }}/{{ new Date(item.deadline).getFullYear() }}
                    </div>
                </div>

                <div v-if="isModuleChief" class="row">
                    <div class="col-12 col-sm-10 col-md-10 col-xl-10 text-left">
                        {{ item.description }}
                    </div>
                    <div class="col-12 col-sm-2 col-md-2 col-xl-2">
                        <button class="btn btn-primary" @click="deleteModule">D</button>
                    </div>
                </div>

                <div v-if="!isModuleChief" class="row">
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
            developersReady: false,
            isModuleChief: true // impostare a false quando ci sarà l'API sistemata
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

                console.log(this.item);
                /* Decommentare quando l'API sarà sistemata
                if (JSON.parse(localStorage.getItem('user')).email == this.item.chief) {
                    this.isModuleChief = true;
                }
                */
                
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
            weekAgo.setDate(today.getDate()-7);
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
        openModule () {
            this.$emit('openModule', this.item);
        },
        deleteModule () {
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            this.$http.delete(localStorage.getItem('path') + '/projects/' + this.projectName + '/modules/' + this.item.name, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                    res = JSON.parse(res);
                    console.log(res);
                } catch (error) {console.log(error)}
                //this.projectDetail = res;//lo memorizzo nei data di questa view per poi poterlo passare al componente container (tramite props) che lo userà per creare i componenti tiles

                //this.modulesArr = res.modules;

                //this.projectReady = true;
            }, (err) => {
                console.log(err.body);
            });
        }
    }
};
</script>

<style scoped>
.list-group-item:hover {
    background-color: lightgray;
}
</style>