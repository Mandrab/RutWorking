<template>
<div class="container">
    <div class="row d-none d-md-flex">
      <div class="col-md-6" v-for="(text, index) in stages" :item="text" :key="index">
        
      </div>
    </div>
    <div class="row d-md-none">
      <div class="col-12">
        <swiper>
          <swiper-slide v-for="(text, index) in stages" class="px-2" :item="text" :key="index">
           
          </swiper-slide>
          <div class="swiper-pagination"  slot="pagination"></div>
        </swiper>
      </div>
    </div>


    <!-- PROVA DI UTILIZZO COMPONENTE TASK -->
    <div class="row">

    </div>

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
import task from './Task.vue';

export default {
    data () {
        return {
          
        }
    },
    components: {
      task
    },
    computed: {
      
    },
    mounted() {
      
    },
    created () {
        
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
            
        },
        getTasks () {
          var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
          
          this.$http.get(localStorage.getItem('path') + '/projects/project/' + this.project.name + '/modules/' + , tokenJson).then(function(response) {
          console.log(response.body);
              var res = response.body;
              try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                  res = JSON.parse(res);
              } catch (error) {console.log(error)}
              this.projectDetail = res;//lo memorizzo nei data di questa view per poi poterlo passare al componente container (tramite props) che lo userà per creare i componenti tiles

              this.modulesArr = res.modules;

              console.log(this.modulesArr);

              this.projectReady = true;
          }, (err) => {
              alert("err");
              alert(err.body);
              console.log(err.body);
              this.projectReady = true;
          });
        }
    }
};
</script>

<style scoped>
.list-group-item:hover {
    background-color: lightgray;
}
</style>