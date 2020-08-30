<template>
  <div>
    <transition name="modal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container">
            
              <div class="modal-header text-secondary">
                <slot name="header">
                  Create module
                </slot>
              </div>

              <div class="modal-body">
                <slot name="body">
                    <form @submit.prevent="handleSubmit">
                      <div class="form-group">
                          <label for="name">Name</label>
                          <input type="text" v-model="mod.moduleName" name="name" class="form-control" :class="{ 'is-invalid': submitted && !mod.moduleName }" />
                          <div v-show="submitted && !mod.moduleName" class="invalid-feedback">Name is required</div>
                      </div>
                      <div class="form-group">
                          <label for="description">Description</label>
                          <textarea rows=5 columns=10 v-model="mod.description" name="description" class="form-control" :class="{ 'is-invalid': submitted && !mod.description }" />
                          <div v-show="submitted && !mod.description" class="invalid-feedback">Description is required</div>
                      </div>
                      <div class="form-group">
                          <label for="deadline">Deadline</label>
                          <input type="date" v-model="deadline" name="deadline" class="form-control" :class="{ 'is-invalid': submitted && !deadline }" />
                          <div v-show="submitted && !deadline" class="invalid-feedback">Deadline is required</div>
                      </div>
                      <div class="form-group">
                          <button v-if="!creating" @click.prevent="handleSubmit" class="btn btn-primary" :disabled="creating">Confirm</button>
                          <button v-if="!creating" @click.prevent="closeForm" class="btn btn-link">Cancel</button>
                          <font-awesome-icon v-if="creating" style="color: gray;" icon="spinner" pulse size="2x"/>
                      </div>
                    </form>
                </slot>
              </div>
            </div>
          </div>
        </div>
    </transition>

    <simpleModal v-if="showModal" :title="title" :message="message" @closeModal="closeModal"></simpleModal>
  </div>
</template>

<script>
import simpleModal from './SimpleModal.vue'

export default {
    data () {
        return {
            mod: {
                moduleName: '',
                description: '',
            },
            deadline: '',
            submitted: false,
            creating: false,
            showModal: false,
            title: '',
            message: ''
        }
    },
    components: {
      simpleModal
    },
    props: {
        project: {
            type: Object
        }
    },
    watch: {
        deadline: function () {
            console.log(this.deadline.toString())
            var date = new Date(this.deadline.toString());
            var today = new Date();
            var projectDline = new Date(this.project.deadline);
            if (date > projectDline) {
              
              //alert("oppala")
              //alert(this.deadline);
              //this.deadline = new Date(projectDline.getFullYear()+"-"+projectDline.getMonth()+1+"-"+projectDline.getDate());
              
              

              var day = ("0" + projectDline.getDate()).slice(-2);
              var month = ("0" + (projectDline.getMonth() + 1)).slice(-2);

              var newDate = projectDline.getFullYear() + "-" + (month) + "-" + (day) ;

              this.deadline = newDate;
              //alert(this.deadline);

              //var date = new Date('2011', '01', '18');
              //alert('the original date is ' + date);
              //alert(date.getDate());

              /*
              var newdate = new Date(date);
              newdate.setDate(newdate.getDate() - (date.getDate()-1)); // minus the date

              */

              //var nd = new Date(newdate);
              //alert('the new date is ' + nd);

              /*
              if(newdate>=projectDline){
                //qui sei nel mese proprio sbagliato
                alert("Invalid date!");
                this.deadline = new Date(projectDline)
              }else{
                this.deadline = new Date(projectDline)
              }

              */

              /*
              var firstDayMonth = new Date();
              console.log(date)
              console.log(date.getDate())
              console.log(date.getDate())
              console.log("§§§§§§§§§§§§§§§§§§§")
              firstDayMonth.setDate(date.getDate()-(date.getDate()+1));
              console.log(firstDayMonth.getDate())
              console.log(firstDayMonth)
              */
            }
            if (date < today) {
                this.deadline = '';
                this.title = 'Choose a date';
                this.message = "Invalid date!";
                this.showModal = true;
            }
        }
    },
    methods: {
        handleSubmit() {
            this.submitted = true;
            if (this.mod.moduleName && this.mod.description && this.deadline) {
                this.addModule();
            }
        },
        addModule() {
            this.creating = true;
            var tokenjson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            var json = {
                "description": this.mod.description,
                "deadline": this.deadline.toString()
            }
            
            this.$http.post(localStorage.getItem('path') + '/projects/' + this.project.name+'/modules/' + this.mod.moduleName, json, tokenjson).then(function(response) {
                console.log(response.body);
                this.$emit('moduleAdded');
                this.closeForm();
            }, (err) => {
                console.log(err.body);
                this.showModal = true;
                this.title = 'Error';
                this.message = err.body;
                this.creating = false;
            });
        },
        closeForm () {
            this.creating = false;
            this.$emit('closeModal');
        },
        closeModal() {
            this.showModal = false;
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

@media (min-width: 992px) {
  .modal-container {
    width: 50%;
  }
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
