<template>
  <div>
    <transition name="modal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container">
              <div class="modal-header text-secondary">
                <slot name="header">
                  Add a developer
                </slot>
              </div>
              <div class="modal-body">
                <slot name="body">
                    <form @submit.prevent="handleSubmit">
                      <div class="form-group">
                        <label for="e-mail">User e-mail</label>
                        <input type="email" v-model="email" name="e-mail" class="form-control" :class="{ 'is-invalid': submitted && !email }" />
                        <div v-show="submitted && !email" class="invalid-feedback">User e-mail is required</div>
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
        email: '',
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
      projectName: {
          type: String
      },
      moduleName: {
          type: String
      }
  },
  methods: {
    handleSubmit() {
        this.submitted = true;
        this.showModal = false;
        if (this.email) {
            this.addUser();
        }
    },
    addUser() {
        this.adding = true;
        var tokenjson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
    
        this.$http.post(localStorage.getItem('path') + '/projects/' + this.projectName + '/modules/' + this.moduleName + "/developers/" + this.email, {}, tokenjson).then(function() {
            this.adding = false;
            this.email = '';
            this.submitted = false;
            this.$emit('closeModal');
        }, (err) => {
            this.adding = false;
            this.title = 'Error';
            this.message = err.body;
            this.showModal = true;
        });
    },
    closeForm() {
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
