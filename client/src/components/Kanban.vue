<template>
  <div class="container">
    <div v-if="isSwiper()" class="row" style="font-size: 20px;">
      <div class="col-md-3 p-1" v-for="(title, index) in stages" :key="index">
        <b> {{ title }} </b>
        <kanbanStage v-if="areTasksReady" :title="title" :tasks="groupedTasks[index + 1]" @addTask="showModalTaskForm" @updateTask="getTasks"></kanbanStage>
      </div>
    </div>
    <div v-else class="row" style="font-size: 20px;">
      <div class="col-12">
        <swiper>
          <swiper-slide v-for="(title, index) in stages" class="px-2 m-0" :key="index">
            <b> {{ title }} </b>
            <font-awesome-icon v-if="title != 'DONE'" class="float-right" style="color: gray;" icon="angle-right" size="lg"/>
            <font-awesome-icon v-if="title != 'TO-DO'" class="float-left" style="color: gray;" icon="angle-left" size="lg"/>
            <kanbanStage v-if="areTasksReady" :title="title" :tasks="groupedTasks[index + 1]" @addTask="showModalTaskForm" @updateTask="getTasks"></kanbanStage>
          </swiper-slide>
          <div class="swiper-pagination" slot="pagination"></div>
        </swiper>
      </div>
    </div>

    <createTaskFormModal v-if="showModalFormTask" :insertUser="isUserRequired" @closeModal="hideModalTaskForm"></createTaskFormModal>
  </div>
</template>

<script>
import kanbanStage from '../components/KanbanStage.vue';
import createTaskFormModal from '../components/CreateTaskFormModal.vue';
import { vueWindowSize } from 'vue-window-size';
vueWindowSize.init();

export default {
  data() {
    return {
      swiperOptions: {
        pagination: {
          el: '.swiper-pagination'
        },
      },
      module: {},
      tasksArr: [],
      groupedTasks: [this.stages.length],
      areTasksReady: false,
      window: {
        width: 0,
        height: 0
      },
      showModalFormTask: false,
      isUserRequired: false
    }
  },
  components:{
    kanbanStage,
    createTaskFormModal
  },
  props: {
    stages: {
      type: Array,
      required: true,
    }
  },
  methods: {
    init() {
      window.addEventListener('resize', this.handleResize);
      this.handleResize();
      this.module = JSON.parse(localStorage.getItem('module'));
    },
    isSwiper(){
      return this.window.width >= 768;
    },
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    getTasks() {
      this.areTasksReady = false;
      var tokenJson = { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
      
      this.$http.get(localStorage.getItem('path') + '/projects/' + this.module.project + '/modules/' + this.module.name + '/kanban', tokenJson).then(function(response) {
        this.tasksArr = response.body;
        this.groupTasksByStage();
        this.areTasksReady = true;
      }, (err) => {
        console.log(err.body);
      });
    },
    groupTasksByStage() {
      this.groupedTasks = [this.stages.length];
      for (var i = 0; i < this.stages.length; i++) {
        var stage = [];
        this.tasksArr.forEach(t => {
          if (t.status == this.stages[i]) {
            stage.push(t);
          }
        });
        this.groupedTasks.push(stage);
      }
    },
    showModalTaskForm(user) {
      this.isUserRequired = user;
      this.showModalFormTask = true;
    },
    hideModalTaskForm() {
      this.getTasks();
      this.showModalFormTask = false;
    }
  },
  created() {
    this.init();
    this.getTasks();
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize);
    localStorage.removeItem('projectName');
    localStorage.removeItem('moduleName');
    localStorage.removeItem('isProjectChief');
    localStorage.removeItem('isModuleChief');
  }
};
</script>

<style lang="scss" scoped>
.list-group-item:hover {
    background-color: lightgray;
}
.swiper {
    height: 300px;
    width: 100%;
  
    .swiper-slide {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-weight: bold;
      font-size: 30 * 2;
      background-color: white;
    }
  }
</style>