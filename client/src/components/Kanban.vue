<template>
    <div class="row">
        <div class="col-12 col-sm-3 col-md-3 col-xl-3">
            <h5> TODO </h5>
        </div>
        <div class="col-12 col-sm-3 col-md-3 col-xl-3">
            <h5> ASSIGNED </h5>
        </div>
        <div class="col-12 col-sm-3 col-md-3 col-xl-3">
            <h5> IN PROGRESS </h5>
        </div>
        <div class="col-12 col-sm-3 col-md-3 col-xl-3">
            <h5> DONE </h5>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
            ready: false,
            deadlineColor: 'black',
            developers: [],
            developersReady: false
        }
    },
    created () {
        console.log(this.item);
        this.init();
        this.checkDeadline();
    },
    props: {
        item: {
            type: Object
        },
        projectName: {
            type: String
        }
    },
    watch: {
        item: function () {
            this.checkDeadline();
        }
    },
    methods: {
        init () {
            this.developersReady = false;
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            console.log(localStorage.getItem('path') + '/projects/' + this.projectName + '/modules/' + this.item.name);
            this.$http.get(localStorage.getItem('path') + '/projects/' + this.projectName + '/modules/' + this.item.name, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                    res = JSON.parse(res);
                } catch (error) {console.log(error)}
                console.log(res);
                this.developers = res.developers;
                this.developersReady = true;
                
            }, (err) => {
                alert("err");
                alert(err.body);
                console.log(err.body);
                this.developersReady = false;
            });
        },
        checkDeadline () {
            this.ready = false;
            var date = new Date(this.item.deadline);
            var weekAgo = new Date();
            var today = new Date();
            weekAgo.setDate(today.getDate()-7);
            if (date <= today && date >= weekAgo ) {
                this.deadlineColor = 'orange';
            }
            else if(date < weekAgo) {
                this.deadlineColor = 'red';
            } else { 
                this.deadlineColor = 'green';
            }
            this.ready = true;
        },
        open () {
            this.$emit('openModule', this.item);
        }
    }
};
</script>

<style scoped>
.list-group-item:hover {
    background-color: lightgray;
}
</style>