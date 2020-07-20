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
export default {
    data () {
        return {
          
        }
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
            
        }
    }
};
</script>

<style scoped>
.list-group-item:hover {
    background-color: lightgray;
}
</style>