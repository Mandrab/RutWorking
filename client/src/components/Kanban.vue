<template>
<div class="container">
    <div class="row d-none d-md-flex">
      <div class="col-md-3" v-for="(title, index) in stages" :key="index">
        <kanbanStage :title="title"></kanbanStage>
      </div>
    </div>
    <div class="row d-md-none">
      <div class="col-12">
        <swiper>
          <swiper-slide v-for="(title, index) in stages" class="px-2 m-0" :key="index">
            <kanbanStage :title="title"></kanbanStage> <!--qui ci sarebbe poi un componente a cui passiamo title-->
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
import kanbanStage from '../components/kanbanStage.vue';
export default {
    data () {
        return {
            swiperOptions: {
            pagination: {
              el: '.swiper-pagination'
            },
            // Some Swiper option/callback...
          }
        }
    },
    components:{
      kanbanStage
    },
    computed: {
      
    },
    mounted() {
      init();
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
            //fare la get dei task(kanban) e salvarli in una var da passare al kanbanStage components(la colonna) che si occuperà di mostrarli a video
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