<template>
    <transition name="modal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container">
              <div class="modal-header text-secondary">
                <slot name="header">
                  {{ title }}
                </slot>
              </div>
              <div class="modal-body text-danger">
                <slot name="body">
                    <strong>
                        {{ message }}
                    </strong>
                    <br/> 
                        <div v-if="secondaryMessage" class="text-secondary">
                            {{ secondaryMessage }}
                        </div> 
                </slot>
              </div>
              <div class="modal-footer">
                <slot name="footer">
                  <button class="modal-default-button btn btn-primary" @click="$emit('proceed')">
                    Confirm
                  </button>
                  <button class="modal-default-button btn btn-link" @click="$emit('cancel')">
                    Cancel
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
  data() {
    return {
      showModal: false
    }
  },
  props: {
    title: {
      type: String
    },
    message: {
      type: String
    },
    secondaryMessage: {
      type: String
    }
  }
};
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
