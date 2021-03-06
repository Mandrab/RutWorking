<template>
    <div class="mt-2 mb-2">
        <li v-if="isModuleMember" class="list-group-item" id="member" @click="openModule">
            <div>
                <div class="row mb-3">
                    <div v-if="ready" style="position: absolute; top: 15px; right: 15px; font-size: 12px;" v-bind:style="{ color: deadlineColor }">
                        {{ new Date(item.deadline).getDate() }}/{{ new Date(item.deadline).getMonth() + 1 }}/{{ new Date(item.deadline).getFullYear() }}
                    </div>
                    <div class="col-12 text-left font-weight-bold h5 pb-0 mb-0">
                        {{ item.name }}
                    </div>
                     <div v-if="!isModuleChief" class="col-12 text-left">
                        <div class="hovered" @click.stop="toggleDesc" v-bind:class="{ 'hide-desc': isDescHide }"> {{ item.description }} </div>  
                    </div>

                    <div v-if="isModuleChief" class="col-9 col-sm-9 col-md-10 col-lg-10 text-left">
                        <div class="hovered" @click.stop="toggleDesc" v-bind:class="{ 'hide-desc': isDescHide }"> {{ item.description }} </div>  
                    </div>
                    <div v-if="ready && isModuleChief" class="col-3 col-sm-3 col-md-2 col-lg-2 text-right float-right small px-0">
                        <div class="row col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" v-if="isModuleChief">
                            <div v-if="isModuleChief && isUserCreationHide" @click.stop="expandUserCreation" class="add-user-btn"><font-awesome-icon icon="user-plus" class="add-user-icon" size="2x"/></div>
                            <div v-if="isModuleChief && !isUserCreationHide" @click.stop="reduceUserCreation" class="add-user-btn"><font-awesome-icon icon="user-times" class="add-user-icon" size="2x"/></div>
                            <div v-if="isModuleChief" @click.stop="askConfirmation" class="delete-btn"><font-awesome-icon icon="trash-alt" class="delete-icon" size="2x"/></div>
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
                        <div> {{ item.description }} </div>  
                    </div>
                </div>
            </div>  
        </li>

        <simpleModal v-if="showModal" :title="title" :message="message" @closeModal="closeModal"></simpleModal>
        <confirmationModal v-if="showConfirmationModal" :title="title" :message="message" @proceed="proceed" @cancel="cancel"></confirmationModal>
    </div>
</template>

<script>
import simpleModal from '../components/SimpleModal.vue'
import confirmationModal from './ConfirmationModal.vue'

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
            adding: false,
            showModal: false,
            showConfirmationModal: false,
            title: '',
            message: ''
        }
    },
    components: {
        simpleModal,
        confirmationModal
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
        init() {
            this.developersReady = false;
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
           
            if (this.isMember) {
                this.$http.get(localStorage.getItem('path') + '/projects/' + this.projectInfo.projectName + '/modules/' + this.item.name, tokenJson).then(function(response) {
                    var res = response.body;
                    this.developers = res.developers;
                    if (JSON.parse(localStorage.getItem('user')).email == this.item.chief) {
                        this.isModuleChief = true;
                    }
                    if (JSON.parse(localStorage.getItem('user')).email == this.projectInfo.isProjectChief) {
                        this.isProjectChief = true;
                    }
                    this.moduleInfo = { 'moduleName': this.item.name, 'isModuleChief': this.isModuleChief };
                    this.developersReady = true;
                }, (err) => {
                    console.log(err.body);
                    this.developersReady = false;
                });
            }
        },
        checkDeadline() {
            this.ready = false;
            var date = new Date(this.item.deadline);
            var weekLater = new Date();
            var today = new Date();
            weekLater.setDate(today.getDate() + 7);
            if (date >= today && date <= weekLater ) {
                this.deadlineColor = 'orange';
            } else if (date < today) {
                this.deadlineColor = 'red';
            } else { 
                this.deadlineColor = 'green';
            }
            this.ready = true;
        },
        toggleDesc() {
            this.isDescHide = !this.isDescHide;
        },
        expandUserCreation () {
            this.isUserCreationHide = false;
        },
        reduceUserCreation() {
            this.isUserCreationHide = true;
        },
        openModule() {
            localStorage.removeItem('isModuleChief');
            localStorage.setItem('isModuleChief', this.isModuleChief);

            localStorage.removeItem('moduleName');
            localStorage.setItem('moduleName', this.item.name);

            localStorage.removeItem('developers');
            localStorage.setItem('developers', this.developers);

            this.$emit('openModule', this.item);
        },
        askConfirmation() {
            this.title = 'Delete module';
            this.message = 'Do you want to delete this module?';
            this.showConfirmationModal = true;
        },
        proceed() {
            this.showConfirmationModal = false;
            this.deleteModule();
        },
        cancel() {
            this.showConfirmationModal = false;
        },
        deleteModule() {
            var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.delete(localStorage.getItem('path') + '/projects/' + this.projectInfo.projectName + '/modules/' + this.item.name, tokenJson).then(function() {
                this.$emit('refreshModulesList', this.item);
            }, (err) => {
                console.log(err.body);
            });
        },
        handleSubmit() {
            this.submitted = true;
            this.showModal = false;
            if (this.email) {
                this.addUser(this.email);
            }
        },
        addUser(email) {
            this.adding = true;
            var tokenjson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
        
            this.$http.post(localStorage.getItem('path') + '/projects/' + this.projectInfo.projectName + '/modules/' + this.item.name + "/developers/" + email, {}, tokenjson).then(function() {
                this.adding = false;
                this.reduceUserCreation();
                this.email = '';
                this.submitted = false;
            }, (err) => {
                this.adding = false;
                this.title = 'Error';
                this.message = err.body;
                this.showModal = true;
            });
        },
        closeModal() {
            this.showModal = false;
        }
    },
    created() {
        this.init();
        this.checkDeadline();
        this.isModuleMember = this.isMember;
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

.hide-desc {
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

.add-user-btn {
    position: absolute;
    top: 1px;
    right: 20px;
    bottom: 20px;
    margin: 3px;
    background-color: none;
    cursor: pointer;
}

.add-user-icon {
    position: absolute;
    top: 1px;
    right: 20px;
    bottom: 20px;
    padding: 0px;
    margin: 3px;
    color: #007BFF;
}

.add-user-icon:hover {
    color: #0069D9;
}

.delete-btn {
    position: absolute;
    top: 1px;
    right: 2px;
    bottom: 20px;
    margin: 3px;
    color: #be0000;
    background-color: none;
    cursor: pointer;
}

.delete-icon {
    position: absolute;
    top: 1px;
    right: 2px;
    bottom: 20px;
    padding: 0px;
    margin: 3px;
    color: #be0000;
}

.delete-icon:hover {
    color: #a50000;
}

</style>