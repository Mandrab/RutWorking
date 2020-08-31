<template>
  <div>
    <transition name="modal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container">
              <div class="modal-header text-secondary">
                <slot name="header">
                  Register a new user
                </slot>
              </div>
              <div class="modal-body">
                <slot name="body">
                    <form @submit.prevent="handleSubmit">
                      <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" v-model="user.name" name="name" class="form-control" :class="{ 'is-invalid': submitted && !user.name }" />
                        <div v-show="submitted && !user.name" class="invalid-feedback">Name is required</div>
                      </div>
                      <div class="form-group">
                        <label for="surname">Surname</label>
                        <input type="text" v-model="user.surname" name="surname" class="form-control" :class="{ 'is-invalid': submitted && !user.surname }" />
                        <div v-show="submitted && !user.surname" class="invalid-feedback">Surname is required</div>
                      </div>
                      <div class="form-group">
                        <label for="email">E-mail</label>
                        <input type="email" v-model="user.email" name="email" class="form-control" :class="{ 'is-invalid': submitted && !user.email }" />
                        <div v-show="submitted && !user.email" class="invalid-feedback">E-mail is required</div>
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
        user: {
          name: '',
          surname: '',
          email: '',
          role: '',
        },
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
  methods: {
      handleSubmit() {
        this.submitted = true;
        if (this.user.name && this.user.surname && this.user.email) {
          this.addUser();
        }
      },
      addUser() {
        this.creating = true;
        var tokenjson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
        var json = {
          "role": "user",
          "name": this.user.name,
          "surname": this.user.surname
        }
        
        this.$http.post(localStorage.getItem('path') + '/user/' + this.user.email, json, tokenjson).then(function() {
          this.$emit('userAdded');
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
