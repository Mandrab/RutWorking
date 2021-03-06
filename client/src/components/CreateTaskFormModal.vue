<template>
  <div>
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
                        <input type="text" v-model="t.taskName" name="name" class="form-control" :class="{ 'is-invalid': submitted && !t.taskName }" />
                        <div v-show="submitted && !t.taskName" class="invalid-feedback">Name is required</div>
                      </div>
                      <div class="form-group">
                        <label for="description">Description</label>
                        <textarea rows=5 columns=10 v-model="t.description" name="description" class="form-control" :class="{ 'is-invalid': submitted && !t.description }" />
                        <div v-show="submitted && !t.description" class="invalid-feedback">Description is required</div>
                      </div>
                      <div v-if="insertUser" class="form-group">
                        <label for="assignee">Assignee e-mail</label>
                        <input type="text" v-model="t.assignee" name="assignee" class="form-control" :class="{ 'is-invalid': submitted && !t.assignee }" />
                        <div v-show="submitted && !t.assignee" class="invalid-feedback">Assignee e-mail is required</div>
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
  data() {
    return {
      t: {
        taskName: '',
        description: '',
        assignee: '',
      },
      submitted: false,
      creating: false,
      projectName: localStorage.getItem('projectName'),
      moduleName: localStorage.getItem('moduleName'),
      showModal: false,
      title: '',
      message: ''
    }
  },
  components: {
    simpleModal
  },
  props: {
    insertUser: {
      type: Boolean
    }
  },
  methods: {
    handleSubmit() {
      this.submitted = true;
      if (this.t.taskName && this.t.description && ((this.insertUser && this.t.assignee) || !this.insertUser)) {
        this.addTask();
      }
    },
    addTask() {
        this.creating = true;
        var tokenjson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
        var state;
        if (this.insertUser) {
          state = "ASSIGNED";
        } else {
          state = "TO-DO";
        }
        var json = {
          "name": this.t.taskName,
          "description": this.t.description,
          "status": state,
          "assignee": this.t.assignee
        }
        
        this.$http.post(localStorage.getItem('path') + '/projects/' + this.projectName + '/modules/' + this.moduleName + "/kanban" , json, tokenjson).then(function() {
          this.$emit('taskAdded');
          this.closeForm();
        }, (err) => {
          console.log(err.body);
          this.showModal = true;
          this.title = 'Error';
          this.message = err.body;
          this.creating = false;
        });
    },
    closeForm() {
      this.creating = false;
      this.$emit('closeModal');
    },
    closeModal() {
      this.showModal = false;
    }
  },
  mounted() {
    this.projectName = localStorage.getItem('projectName');
    this.moduleName = localStorage.getItem('moduleName');
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

.modal-default-button {
  float: right;
}

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
