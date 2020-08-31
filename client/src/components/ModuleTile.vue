<template>
    <div class="mt-2 mb-2">
        <li v-if="isModuleMember" class="list-group-item" id="member" @click="openModule">
            <div>
                <div class="row">
                    <div v-if="ready" style="position: absolute; top: 15px; right: 15px; font-size: 12px;" v-bind:style="{ color: deadlineColor }">
                        {{ new Date(item.deadline).getDate() }}/{{ new Date(item.deadline).getMonth() + 1 }}/{{ new Date(item.deadline).getFullYear() }}
                    </div>
                    <div class="col-12 text-left font-weight-bold h5 pb-0 mb-0">
                        {{ item.name }}
                    </div>
                     <div v-if="!isModuleChief" class="col-12 text-left">
                        <div class="hovered" @click.stop="toggleDesc" v-bind:class="{ 'hide-desc': isDescHide }"> {{ item.description }}</div>  
                    </div>

                    <div v-if="isModuleChief" class="col-9 col-sm-9 col-md-10 col-lg-11 text-left">
                        <div class="hovered" @click.stop="toggleDesc" v-bind:class="{ 'hide-desc': isDescHide }"> {{ item.description }}</div>  
                    </div>
                    <div v-if="ready && isModuleChief" class="col-3 col-sm-3 col-md-2 col-lg-1 text-right float-right small px-0">
                        <div v-if="isModuleChief">
                            <b-dropdown size="sm" id="dropdown-options" right class="m-2">
                                <template v-slot:button-content>
                                    <font-awesome-icon icon="ellipsis-h"/>
                                </template>
                                <b-dropdown-item v-if="isModuleChief && isUserCreationHide" @click.stop="expandUserCreation"><font-awesome-icon icon="user-plus"/> Add user</b-dropdown-item>
                                <b-dropdown-item v-if="isModuleChief && !isUserCreationHide" @click.stop="reduceUserCreation"><font-awesome-icon icon="times"/> Close user</b-dropdown-item>
                                <b-dropdown-divider></b-dropdown-divider>
                                <b-dropdown-item v-if="isModuleChief" @click.stop="deleteModule" ><font-awesome-icon icon="trash-alt"/> <a href="#" class="r">Delete module</a></b-dropdown-item>
                            </b-dropdown>
                        </div>
                    </div>

                    <div v-if="!isUserCreationHide"  @click.stop="" class="col-12" style="background-color:">
                        <hr/>
                        <div class="col-sm-4 col-md-4 col-xl-4 offset-sm-4 offset-md-4 offset-xl-4">
                            <h4>Add a developer</h4>
                            <form @submit.prevent="handleSubmit">
                                <div class="form-group">
                                    <label for="email">User e-mail</label>
                                    <input type="email" v-model="email" name="email" class="form-control" :class="{ 'is-invalid': submitted && !email }" />
                                    <div v-show="submitted && !email" class="invalid-feedback">E-mail is required</div>
                                </div>

                                <div class="form-group">
                                    <button @click="handleSubmit" class="btn btn-primary" :disabled="adding">Add user</button>
                                    <font-awesome-icon v-if="adding" style="color: gray;" icon="spinner" pulse size="2x"/>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </li>

        <li v-if="!isModuleMember" class="list-group-item">
            <div>
                <div class="row">
                    <div v-if="ready" class="text-secondary" style="position: absolute; top: 15px; right: 15px; font-size: 12px;">
                        {{ new Date(item.deadline).getDate() }}/{{ new Date(item.deadline).getMonth() + 1 }}/{{ new Date(item.deadline).getFullYear() }}
                    </div>
                    <div class="col-12 text-left font-weight-bold h5 pb-0 mb-0 text-secondary">
                        {{ item.name }}
                    </div>
                     <div class="col-12 text-left text-secondary">
                        <div> {{ item.description }}</div>  
                    </div>
                </div>
            </div>  
        </li>
    </div>
</template>

<script>

export default {
    data() {
        return {
            ready: false,
            deadlineColor: 'black',
            developers: [],
            developersReady: false,
            isProjectChief: false,
            isModuleChief: false,
            isModuleMember: false,
            moduleInfo: {},
            isDescHide: true,
            isUserCreationHide: true,
            email: '',
            submitted: false,
            adding: false
        }
    },
    created() {
        console.log(this.item);
        this.init();
        this.checkDeadline();

        this.isModuleMember = this.isMember;
    },
    props: {
        item: {
            type: Object
        },
        projectInfo: {
            type: Object
        },
        isMember: {
            type: Boolean
        }
    },
    watch: {
        item: function () {
            this.checkDeadline();
        }
    },
    methods: {
        init () {
            console.log(this.item);
            console.log(this.projectInfo);
            this.developersReady = false;
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            console.log(localStorage.getItem('path') + '/projects/' + this.projectInfo.projectName + '/modules/' + this.item.name);

            if (this.isMember) {
                this.$http.get(localStorage.getItem('path') + '/projects/' + this.projectInfo.projectName + '/modules/' + this.item.name, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
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

                this.moduleInfo = { 'moduleName': this.item.name, 'isModuleChief': this.isModuleChief };
                //localStorage.setItem('isModuleChief', this.isModuleChief); // SBAGLIATO, così sovrascrivo
                //localStorage.setItem('moduleName', this.item.name); ////////

                this.developersReady = true;

            }, (err) => {
                console.log(err.body);
                this.developersReady = false;
            });
            }
            
        },
        toggleDesc() {
        this.isDescHide = !this.isDescHide;
        //this.$forceUpdate();
        },
        reduceUserCreation () {
            this.isUserCreationHide = true;
        },
        expandUserCreation () {
            this.isUserCreationHide = false;
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
        openModule() {
            // PROVARE QUI
            localStorage.removeItem('isModuleChief');
            localStorage.setItem('isModuleChief', this.isModuleChief);

            localStorage.removeItem('moduleName');
            localStorage.setItem('moduleName', this.item.name);

            localStorage.removeItem('developers');
            localStorage.setItem('developers', this.developers);

            this.$emit('openModule', this.item);
        },
        deleteModule() {
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            this.$http.delete(localStorage.getItem('path') + '/projects/' + this.projectInfo.projectName + '/modules/' + this.item.name, tokenJson).then(function(response) {
                console.log(response.body);

                this.$emit('refreshModulesList', this.item);
            }, (err) => {
                console.log(err.body);
            });
            
        },
        handleSubmit() {
            this.submitted = true;
            //this.showModal=false;
            if (this.email) {
                this.addUser(this.email);
            }
        },
        addUser(email) {
            this.adding = true;
            var tokenjson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
        
            this.$http.post(localStorage.getItem('path') + '/projects/'+this.projectInfo.projectName+'/modules/' + this.item.name + "/developers/" + email, {}, tokenjson).then(function(response) {
                console.log(response.body);
                console.log(this.adding);
                this.adding=false;
                this.reduceUserCreation();
                this.email = '';
                this.submitted = false;
            }, (err) => {
                console.log(err.body);
                this.adding = false;
            });



            
        }
    }
};
</script>

<style scoped>
#member:hover {
    background-color: lightgray;
}
@media (max-width: 576px) {
    .btns-opts {
      padding-left: 0px !important;
    }
}

.hide-desc{
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-x: hidden;
  width: 100%;
  cursor: pointer;
}

.hovered:hover {
    cursor: pointer;
    text-decoration-line: underline;
}
.r{
    color:red;
}

</style>