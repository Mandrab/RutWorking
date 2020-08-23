<template>
    <transition name="modal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container">
            
              <div class="modal-header text-secondary">
                <slot name="header">
                  Create task
                </slot>
              </div>

              <div class="modal-body">
                <slot name="body">
                    
                    <form @submit.prevent="handleSubmit">
                      <div class="form-group">
                          <label for="name">Name</label>
                          <input type="text" v-model="t.taskName" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
                          <div v-if="submitted && errors.has('name')" class="invalid-feedback">{{ errors.first('name') }}</div>
                      </div>
                      <div class="form-group">
                          <label for="description">Description</label>
                          <textarea rows=5 columns=10 v-model="t.description" v-validate="'required'" name="description" class="form-control" :class="{ 'is-invalid': submitted && errors.has('description') }" />
                          <div v-if="submitted && errors.has('description')" class="invalid-feedback">{{ errors.first('description') }}</div>
                      </div>
                      <div v-if="insertUser" class="form-group">
                          <label for="assignee">Assignee</label>
                          <input type="text" v-model="t.assignee" v-validate="'required'" name="assignee" class="form-control" :class="{ 'is-invalid': submitted && errors.has('assignee') }" />
                          <div v-if="submitted && errors.has('assignee')" class="invalid-feedback">{{ errors.first('assignee') }}</div>
                      </div>
                      <!--<div class="form-group">
                          <label for="deadline">Deadline</label>
                          <input type="date" v-model="deadline" v-validate="'required'" name="deadline" class="form-control" :class="{ 'is-invalid': submitted && errors.has('deadline') }" />
                          <div v-if="submitted && errors.has('deadline')" class="invalid-feedback">{{ errors.first('deadline') }}</div>
                      </div>-->
                      <div class="form-group">
                          <button @click.prevent="handleSubmit" class="btn btn-primary" :disabled="creating">Confirm</button>
                          <img v-show="creating" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                          <button @click.prevent="closeForm" class="btn btn-link">Cancel</button>
                      </div>
                    </form>
                </slot>
              </div>
            </div>
          </div>
        </div>
      </transition>
</template>

<script>
export default {
    data () {
        return {
            t: {
                taskName: '',
                description: '',
                assignee: '',
            },
            submitted: false,
            creating: false,
            projectName: localStorage.getItem('projectName'),
            moduleName: localStorage.getItem('moduleName')
        }
    },
    props: {
        insertUser: {
            type: Boolean
        }
    },
    watch: {
    },
    mounted() {
        alert(this.insertUser)
        
        this.projectName = localStorage.getItem('projectName');
        this.moduleName = localStorage.getItem('moduleName');
        //qui sotto usa il metodo sbagliato per settarli 
        //this.isProjectChief = localStorage.getItem('isProjectChief');
        //this.isModuleChief = localStorage.getItem('isModuleChief');


    },
    methods: {
        handleSubmit() {
            this.submitted = true;
            this.$validator.validate().then(valid => {
                if (valid) {
                    this.addTask();
                }
            });
        },
        addTask() {
            this.creating = true;
            var vm = this;
            var tokenjson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            var stat ;
            if(this.insertUser){stat = "ASSIGNED"}else{stat = "TO-DO"}
            
            var json = {
                "name": this.t.taskName,
                "description": this.t.description,
                "status": stat,
                "assignee": this.t.assignee
            }
            console.log(localStorage.getItem('path') + '/projects/'+this.projectName+'/modules/' + this.moduleName + "/kanban" );

            vm.$http.post(localStorage.getItem('path') + '/projects/'+this.projectName+'/modules/' + this.moduleName + "/kanban" , json, tokenjson).then(function(response) {
                alert(response.body)
                console.log(response.body);
                console.log(this.creating);
                this.$emit('taskAdded');
                this.closeForm();
            }, (err) => {
                alert(err.body);
                this.creating = false;
            });
        },
        closeForm () {
            this.creating = false;
            this.$emit('closeModal'); // notifico il padre

        }
    }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 80%;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  /*margin: 20px 0;*/
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.modal-footer {
    padding: 10px 16px 0px 0px
}
</style>
