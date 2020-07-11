<template>
    <transition name="modal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container">
            
              <div class="modal-header text-secondary">
                <slot name="header">
                  Create Module
                </slot>
              </div>

              <div class="modal-body">
                <slot name="body">
                    
                    <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="module-name">Module Name</label>
                        <input type="text" v-model="module.moduleName" v-validate="'required'" name="module-name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('module-name') }" />
                        <div v-if="submitted && errors.has('module-name')" class="invalid-feedback">{{ errors.first('module-name') }}</div>
                    </div>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea rows=5 columns=10 v-model="module.description" v-validate="'required'" name="description" class="form-control" :class="{ 'is-invalid': submitted && errors.has('description') }" />
                        <div v-if="submitted && errors.has('description')" class="invalid-feedback">{{ errors.first('description') }}</div>
                    </div>
                    <div class="form-group">
                        <label for="deadline">Deadline</label>
                        <input type="date" v-model="deadline" v-validate="'required'" name="deadline" class="form-control" :class="{ 'is-invalid': submitted && errors.has('deadline') }" />
                        <div v-if="submitted && errors.has('deadline')" class="invalid-feedback">{{ errors.first('deadline') }}</div>
                    </div>
                    <div class="form-group">
                        <button @click="handleSubmit" class="btn btn-primary" :disabled="creating">Add Module</button>
                        <img v-show="creating" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                        <button @click="closeForm" class="btn btn-link">Cancel</button>
                    </div>
                </form>
                </slot>
              </div>

              <!-- Lista di moduli component -->

              <div class="modal-footer">
                <slot name="footer">
                  <button class="modal-default-button btn btn-primary" @click="$emit('closeModal')">
                    OK
                  </button>
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
            module: {
                moduleName: '',
                description: '',
            },
            deadline: '',
            submitted: false,
            creating: false,
        }
    },
    props: {
        projectName: {
            type: String
        }
    },
    watch: {
        deadline: function () {
            var date = new Date(this.deadline);
            var today = new Date();
            if (date.getFullYear() < today.getFullYear() || date.getMonth() < today.getMonth() || date.getDate() < today.getDate()) {
                this.deadline = '';
                alert("Invalid date!");
            }
        }
    },
    methods: {
        handleSubmit() {
            this.submitted = true;
            this.$validator.validate().then(valid => {
                if (valid) {
                    this.addModule(this.module);
                }
            });
        },
        addModule (module) {
            this.creating = true;
            var vm = this;
            var tokenjson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            var json = {
                "description": this.module.description,
                "deadline": this.deadline.toString(),
            }
            vm.$http.post(localStorage.getItem('path') + 'projects/'+this.projectName+'/modules/' + module.moduleName, json, tokenjson).then(function(response) {
                console.log(response.body);
                console.log(this.creating);
                //mando un emit al padre con il modulo appena creato
                //var myEmail = localStorage.getItem
                /*var module =   {
                                    "name": module.moduleName,
                                    "chief": "prova@gmail.com",
                                    "modules": [],
                                    "description": "descrizione progetto 4",
                                    "deadline": "2020-09-27T00:00:00.000Z"
                                }*/
                this.$emit('moduleAdded');
                this.closeForm();
            }, (err) => {
                alert(err);
                console.log(err);
                console.log(err.body);
                this.creating = false;
            });
        },
        closeForm () {
            this.creating = false;
            this.$emit('hide'); // notifico il padre

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
  width: 300px;
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
