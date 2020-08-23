<template>
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
                          <input  type="password" v-model="oldPassword" v-validate="'required'" name="old-password" class="form-control" :class="{ 'is-invalid': submitted && errors.has('old-password') }" />
                          <div v-if="submitted && errors.has('old-password')" class="invalid-feedback">{{ errors.first('old-password') }}</div>
                      </div>
                      <div class="form-group">
                          <label for="new-password">New password</label>
                          <input  type="password" v-model="newPassword" v-validate="'required'" name="new-password" class="form-control" :class="{ 'is-invalid': submitted && errors.has('new-password') }" />
                          <div v-if="submitted && errors.has('new-password')" class="invalid-feedback">{{ errors.first('new-password') }}</div>
                      </div>
                      <div class="form-group">
                          <label for="confirm-new-password">Confirm new password</label>
                          <input  type="password" v-model="newPassword2" v-validate="'required'" name="confirm-new-password" class="form-control" :class="{ 'is-invalid': submitted && errors.has('confirm-new-password') }" />
                          <div v-if="submitted && errors.has('confirm-new-password')" class="invalid-feedback">{{ errors.first('confirm-new-password') }}</div>
                      </div>
                      <div class="form-group">
                          <button @click.prevent="handleSubmit" class="btn btn-primary" :disabled="changingPWD">Confirm</button>
                          <img v-show="changingPWD" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
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
            oldPassword: '',
            newPassword: '',
            newPassword2: '',
            submitted: false,
            changingPWD: false,
        }
    },
    methods: {
        handleSubmit() {
            if (this.newPassword != this.newPassword2) {
                alert("The new passwords do not match!")
            }
            this.submitted = true;
            this.$validator.validate().then(valid => {
                if (valid && (this.newPassword == this.newPassword2)) {
                    this.changePWD();
                }
            });
        },
        changePWD() {
            this.changingPWD = true;
            var vm = this;
            var tokenjson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            var json = {
                "oldPassword": this.oldPassword,
                "newPassword": this.newPassword,
            }
            var mail = JSON.parse(localStorage.getItem('user')).email ;//ottieni mail dallo storage
            
            console.log(localStorage.getItem('path') + '/user/' + mail);
            
            vm.$http.put(localStorage.getItem('path') + '/user/' + mail, json, tokenjson).then(function(response) {
                console.log(response.body);
                console.log(this.changingPWD);
                alert("Password changed successfully!")
                this.closeForm();
            }, (err) => {
                alert(err.body);
                this.changingPWD = false;
            });
        },
        closeForm () {
            this.changingPWD = false;
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
  width: 40%;
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
