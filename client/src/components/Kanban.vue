<template>
<div v-if="areTasksReady" class="container">
    <div class="row d-none d-md-flex">
      <div class="col-md-3" v-for="(title, index) in stages" :key="index">
        <kanbanStage :title="title" :tasks="groupedTasks[index + 1]" @updateTask="getTasks"></kanbanStage>
      </div>
    </div>
    <div class="row d-md-none">
      <div class="col-12">
        <swiper>
          <swiper-slide v-for="(title, index) in stages" class="px-2 m-0" :key="index">
            <kanbanStage :title="title" :tasks="groupedTasks[index + 1]" @updateTask="getTasks"></kanbanStage> <!-- passo direttamente i task giusti da visualizzare nella colonna specifica -->
          </swiper-slide>
        </swiper>
      </div>
    </div>

   <swiper ref="mySwiper" :options="swiperOptions">
    <swiper-slide>Slide 1</swiper-slide>
    <swiper-slide>Slide 2</swiper-slide>
    <swiper-slide>Slide 3</swiper-slide>
    <swiper-slide>Slide 4</swiper-slide>
    <swiper-slide>Slide 5</swiper-slide>
    <div class="swiper-pagination" slot="pagination"></div>
  </swiper>

  </div>

  

<!--
  <swiper ref="mySwiper" :options="swiperOptions">
    <swiper-slide>Slide 1</swiper-slide>
    <swiper-slide>Slide 2</swiper-slide>
    <swiper-slide>Slide 3</swiper-slide>
    <swiper-slide>Slide 4</swiper-slide>
    <swiper-slide>Slide 5</swiper-slide>
    <div class="swiper-pagination" slot="pagination"></div>
  </swiper>
    -->
</template>

<script>
import kanbanStage from '../components/KanbanStage.vue';

export default {
    data () {
        return {
            swiperOptions: {
              pagination: {
                el: '.swiper-pagination'
              },
            // Some Swiper option/callback...
            },
            module: {},
            tasksArr: [],
            groupedTasks: [this.stages.length],
            areTasksReady: false
        }
    },
    components:{
      kanbanStage
    },
    computed: {
      
    },
    mounted() {
      
    },
    created () {
        this.init();
        this.getTasks();
    },
    props: {
        stages: {
          type: Array,
          required: true,
      }
    },
    watch: {
        
    },
    methods: {
        init () {
          this.module = JSON.parse(localStorage.getItem('module'));
        },
        getTasks () {
            this.areTasksReady = false;
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            this.$http.get(localStorage.getItem('path') + '/projects/' + this.module.project + '/modules/' + this.module.name + '/kanban', tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                    res = JSON.parse(res);
                } catch (error) {console.log(error)}
                console.log(res);
                this.tasksArr = res;

                this.groupTasksByStage();
                

                console.log("ULTIMOOOO");
                console.log(this.groupedTasks);

                this.areTasksReady = true;

            }, (err) => {
                alert("err");
                alert(err.body);
                console.log(err.body);
                
            });
        },
        groupTasksByStage () {
          this.groupedTasks = [this.stages.length];
          for (var i = 0; i < this.stages.length; i++) {
            var stage = [];
            console.log(this.groupedTasks);
            this.tasksArr.forEach(t => {
              if (t.status == this.stages[i]) {
                stage.push(t);
              }
            });
            this.groupedTasks.push(stage);
          }
          console.log("++++++");
          console.log(this.groupedTasks);
        }
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