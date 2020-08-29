<template>
    <transition name="modal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container">
            
              <div class="modal-header text-secondary">
                <slot name="header">
                  User info
                </slot>
              </div>

              <div class="modal-body">
                <slot name="body">
                    <div class="text-left p-2">
                        <a> <b>Name</b>: {{ item.name }} </a>
                    </div>
                    <div class="text-left p-2">
                        <a> <b>Surname</b>: {{ item.surname }} </a>
                    </div>
                    <div class="text-left p-2">
                        <a> <b>E-mail</b>: {{ item.email }} </a>
                    </div>
                    <div class="text-left p-2">
                        <a> <b>Role</b>: {{ item.role.role.name }} </a>
                    </div>
                    <div class="text-left p-2">
                        <a> <b>Blocked</b>: {{ item.blocked }} </a>
                    </div>
                    <div class="form-group">
                        <button @click.prevent="closeForm" class="btn btn-link">Close</button>
                    </div>
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
        }
    },
    props: {
        item: {
            type: Object
        }
    },
    mounted() {
    },
    methods: {
        closeForm () {
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

@media (min-width: 768px) {
  .modal-container {
    width: 50%;
  }
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
