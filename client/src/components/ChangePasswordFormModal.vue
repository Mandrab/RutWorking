<template>
  <div>
    <transition name="modal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container">
              <div class="modal-header text-secondary">
                <slot name="header">
                  Change password
                </slot>
              </div>
              <div class="modal-body">
                <slot name="body">
                    <form @submit.prevent="handleSubmit">
                      <div class="form-group">
                          <label for="old-password">Old password</label>
                          <input type="password" v-model="oldPassword" name="old-password" class="form-control" :class="{ 'is-invalid': submitted && !oldPassword }" />
                          <div v-show="submitted && !oldPassword" class="invalid-feedback">Old password is required</div>
                      </div>
                      <div class="form-group">
                          <label for="new-password">New password</label>
                          <input type="password" v-model="newPassword" name="new-password" class="form-control" :class="{ 'is-invalid': submitted && !newPassword }" />
                          <div v-show="submitted && !newPassword" class="invalid-feedback">New password is required</div>
                      </div>
                      <div class="form-group">
                          <label for="confirm-new-password">Confirm new password</label>
                          <input type="password" v-model="newPassword2" name="confirm-new-password" class="form-control" :class="{ 'is-invalid': submitted && !newPassword2 }" />
                          <div v-show="submitted && !newPassword2" class="invalid-feedback">New password confirmation is required</div>
                      </div>
                      <div class="form-group">
                          <button v-if="!changingPassword" @click.prevent="handleSubmit" class="btn btn-primary" :disabled="changingPassword">Confirm</button>
                          <font-awesome-icon v-if="changingPassword" style="color: gray;" icon="spinner" pulse size="2x"/>
                          <button v-if="!changingPassword" @click.prevent="closeForm" class="btn btn-link">Cancel</button>
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
          oldPassword: '',
          newPassword: '',
          newPassword2: '',
          submitted: false,
          changingPassword: false,
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
          this.showModal = false;
          if (this.newPassword != this.newPassword2) {
            this.title = 'Password update';
            this.message = 'The new passwords do not match!';
            this.showModal = true;
          }
          this.submitted = true;
          if (this.oldPassword && this.newPassword && this.newPassword2 && (this.newPassword == this.newPassword2)) {
              this.changePassword();
          }
      },
      changePassword() {
          this.changingPassword = true;
          var tokenjson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
          var json = {
              "oldPassword": this.oldPassword,
              "newPassword": this.newPassword,
          }
          var mail = JSON.parse(localStorage.getItem('user')).email;
          
          this.$http.put(localStorage.getItem('path') + '/user/' + mail, json, tokenjson).then(function(response) {
              console.log(response.body);
              this.title = 'Password update';
              this.message = 'Password changed successfully!';
              this.showModal = true;
              this.closeForm();
          }, (err) => {
              this.changingPassword = false;
              this.title = 'Error';
              this.message = err.body;
              this.showModal = true;
          });
      },
      closeForm() {
          this.changingPassword = false;
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
    width: 40%;
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
