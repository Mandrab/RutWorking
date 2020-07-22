<template>
    <div class="mt-2 mb-2">
        <li class="list-group-item" @click="openModule">
            <div>
                <div class="row">
                    <div class="col-12 col-sm-8 col-md-8 col-xl-8 text-left font-weight-bold h5 pb-0 mb-0">
                        {{ item.name }}
                    </div>
                    <div v-if="ready" class="col-6 col-sm-2 col-md-2 col-xl-2 text-left float-right small pt-2 pr-0" v-bind:style="{ color: deadlineColor }">
                        Deadline: {{ new Date(item.deadline).getDate() }}/{{ new Date(item.deadline).getMonth() + 1 }}/{{ new Date(item.deadline).getFullYear() }}
                    </div>
                    <div v-if="ready" class="col-6 col-sm-2 col-md-2 col-xl-2 text-right float-right small px-0">
                        <div>
                            <div v-if="!isModuleChief">
                                <button v-if="expanded" @click.stop="reduceModule" class="btn btn-sm btn-outline-info">^</button>
                                <button v-else @click.stop="expandModule" class="btn btn-sm btn-outline-info">v</button>
                            </div>
                            <div v-else>
                                <b-dropdown size="sm" id="dropdown-options" right class="m-2">
                                    <template v-slot:button-content>
                                        ...
                                    </template>
                                    <b-dropdown-item v-if="isModuleChief && !expanded" @click.stop="expandModule">Read description</b-dropdown-item>
                                    <b-dropdown-item v-if="isModuleChief && expanded" @click.stop="reduceModule">Hide description</b-dropdown-item>
                                    <b-dropdown-item v-if="isModuleChief" @click.stop="">Add user</b-dropdown-item>
                                    <b-dropdown-divider></b-dropdown-divider>
                                    <b-dropdown-item v-if="isModuleChief" @click.stop="deleteModule" class="bg-danger">Delete module</b-dropdown-item>
                                </b-dropdown>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="row">
                    <div v-if="expanded" class="col-12 col-sm-12 col-md-12 col-xl-12 text-left">
                        {{ item.description }}
                    </div>
                    <!--<div v-if="expanded" class="col-2 col-sm-2 col-md-2 col-xl-2 btns-opts">
                        <button v-if="isModuleChief" class="btn btn-sm btn-primary" @click.stop="deleteModule">D</button>
                        <button v-if="isModuleChief" class="btn btn-sm btn-primary" >U</button>
                        
                    </div>

                    <div v-if="!expanded" class="col-10">
                        <button v-if="expanded" @click.stop="reduceModule" class="btn btn-sm btn-outline-info">Press To Reduce</button>
                        <button v-else @click.stop="expandModule" class="btn btn-sm btn-outline-info">Reed Description V</button>
                    </div>
                    <div v-if="!expanded" class="col-2 col-sm-2 col-md-2 col-xl-2 btns-opts">
                        <button v-if="isModuleChief" class="btn btn-sm btn-primary" @click.stop="deleteModule">D</button>
                        <button v-if="isModuleChief" class="btn btn-sm btn-primary" >U</button>
                        
                    </div>-->

                    
                    



                </div>



                <!--<div v-if="!isModuleChief" class="row">
                    <div class="col-12 col-sm-12 col-md-12 col-xl-12 text-left">
                        {{ item.description }}
                    </div>
                </div>-->
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
            isProjectChief: false,
            isModuleChief: false,
            moduleInfo: {},
            expanded: false
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
        projectInfo: {
            type: Object
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
            console.log(localStorage.getItem('path') + '/projects/' + this.projectInfo.projectName + '/modules/' + this.item.name);
            this.$http.get(localStorage.getItem('path') + '/projects/' + this.projectInfo.projectName + '/modules/' + this.item.name, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                    res = JSON.parse(res);
                } catch (error) {console.log(error)}
                console.log(res);
                this.developers = res.developers;
                

                console.log(this.item);

                console.log("PRIMA DEL CONTROLLO");
                console.log(this.isModuleChief);
                if (JSON.parse(localStorage.getItem('user')).email == this.item.chief) {
                    this.isModuleChief = true;
                }
                if (JSON.parse(localStorage.getItem('user')).email == this.projectInfo.isProjectChief) {
                    this.isProjectChief = true;
                }
                console.log("DOPO IL CONTROLLO");
                console.log(this.isModuleChief);

                this.moduleInfo = {'moduleName': this.item.name, 'isModuleChief': this.isModuleChief};
                //localStorage.setItem('isModuleChief', this.isModuleChief); // SBAGLIATO, così sovrascrivo
                //localStorage.setItem('moduleName', this.item.name); ////////

                this.developersReady = true;

            }, (err) => {
                alert("err");
                alert(err.body);
                console.log(err.body);
                this.developersReady = false;
            });
        },
        reduceModule () {
            this.expanded = false;
        },
        expandModule () {
            this.expanded = true;
        },
        checkDeadline () {
            this.ready = false;
            var date = new Date(this.item.deadline);
            var weekLater = new Date();
            var today = new Date();
            weekLater.setDate(today.getDate()+7);
            if (date >= today && date <= weekLater ) {
                this.deadlineColor = 'orange';
            }
            else if(date < today) {
                this.deadlineColor = 'red';
            } else { 
                this.deadlineColor = 'green';
            }
            this.ready = true;
        },
        openModule () {
            // PROVARE QUI
            this.$emit('openModule', this.item);
        },
        deleteModule () {
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            this.$http.delete(localStorage.getItem('path') + '/projects/' + this.projectInfo.projectName + '/modules/' + this.item.name, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                    res = JSON.parse(res);
                    console.log(res);
                } catch (error) {console.log(error)}

                this.$emit('refreshModulesList', this.item);
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
@media (max-width: 576px) {
    .btns-opts {
      padding-left: 0px !important;
    }
}
</style>