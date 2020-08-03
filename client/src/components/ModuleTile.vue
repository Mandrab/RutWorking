<template>
    <div class="mt-2 mb-2">
        <li class="list-group-item" @click="openModule">
            <div>
                <div class="row">
                     <div v-if="ready" style="position: absolute; top:0px; right:0px; font-size: 12px;" v-bind:style="{ color: deadlineColor }">
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
                                    ...
                                </template>
                                <b-dropdown-item v-if="isModuleChief && isUserCreationHide" @click.stop="expandUserCreation">Add user</b-dropdown-item>
                                <b-dropdown-item v-if="isModuleChief && !isUserCreationHide" @click.stop="reduceUserCreation">Close user</b-dropdown-item>
                                <b-dropdown-divider></b-dropdown-divider>
                                <b-dropdown-item v-if="isModuleChief" @click.stop="deleteModule" class="bg-danger">Delete module</b-dropdown-item>
                            </b-dropdown>
                        </div>
                    </div>

                    <div v-if="!isUserCreationHide"  @click.stop="" class="col-12" style="background-color:">
                        <hr/>
                        


                        <div class="col-sm-4 col-md-4 col-xl-4 offset-sm-4 offset-md-4 offset-xl-4">
                            <h4>Aggiungi Utente</h4>
                            <form @submit.prevent="handleSubmit">
                                <div class="form-group">
                                    <label for="email">Email Utente</label>
                                    <input type="email" v-model="email" name="email" class="form-control" :class="{ 'is-invalid': submitted && !email }" />
                                    <div v-show="submitted && !email" class="invalid-feedback">Email is required</div>
                                </div>

                                <div class="form-group">
                                    <button @click="handleSubmit" class="btn btn-primary" :disabled="adding">Add User</button>
                                    <img v-show="adding" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                                </div>
                                
                                <!--<simpleModal v-if="showModal" :mess="loginResponse" @closeModal="closeModal" ></simpleModal>-->
                            </form>
                        </div>

                        

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
            isProjectChief: false,
            isModuleChief: false,
            moduleInfo: {},
            isDescHide: true,
            isUserCreationHide: true,
            email: "",
            submitted: false,
            adding: false
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
        openModule () {
            // PROVARE QUI
            localStorage.setItem('isModuleChief', this.isModuleChief);
            localStorage.setItem('moduleName', this.item.name);
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
            
        },
        handleSubmit () {
            this.submitted = true;
            //this.showModal=false;
            const { email } = this;
            if (email) {
                this.addUser( this.email )
            }
        },
        addUser(email) {
            alert(email);
            this.adding = true;
            var vm = this;
            var tokenjson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            var json = {
                //"description": this.mod.description,
                //"deadline": this.deadline.toString()
            }
            console.log(localStorage.getItem('path') + '/projects/'+this.projectInfo.projectName+'/modules/' + this.item.name + "/developers/" + email);

            vm.$http.post(localStorage.getItem('path') + '/projects/'+this.projectInfo.projectName+'/modules/' + this.item.name + "/developers/" + email, json, tokenjson).then(function(response) {
                alert("added")
                console.log(response.body);
                console.log(this.adding);
                this.adding=false;
                this.reduceUserCreation();
            }, (err) => {
                alert(err);
                console.log(err);
                console.log(err.body);
                this.adding = false;
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

</style>