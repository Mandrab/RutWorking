<template>
    <li class="list-group-item" @click="open"> 
        <div class="row">
            <div class="font-weight-bold h5">
                {{ item.name }}
            </div>
            <div>
                <button v-if="isProjectChief" @click="deleteProject">x</button>
            </div>
        </div>
        <div v-if="ready" class="row float-right small" v-bind:style="{ color: deadlineColor }">
            {{ new Date(item.deadline).getDate() }}/{{ new Date(item.deadline).getMonth() + 1 }}/{{ new Date(item.deadline).getFullYear() }}
        </div>
    </li>		
</template>

<script>
export default {
    watch: {
        item: function () {
            this.checkDeadline();
        }
    },
    data () {
        return {
            ready: false,
            deadlineColor: 'black',
            isProjectChief: false
        }
    },
    created () {
        console.log(this.item);
        if (JSON.parse(localStorage.getItem('user')).email == this.item.chief) {
            this.isProjectChief = true;
        } else {
            this.isProjectChief = false;
        }
        this.checkDeadline();
    },
    props: {
        item: {
            type: Object
        }
    },
    methods: {
        checkDeadline () {
            this.ready = false;
            
            console.log(this.item);
            var ProjectDline = new Date(this.item.deadline);
            
            
            var today = new Date();
            var weekLater = new Date(today);
            weekLater.setDate(today.getDate()+7);

            if (ProjectDline >= today && ProjectDline <= weekLater ) {
                this.deadlineColor = 'orange';
            }
            else if(ProjectDline < today) {
                this.deadlineColor = 'red';
            } else { 
                this.deadlineColor = 'green';
            }
            this.ready = true;
        },
        open () {
            this.$emit('openDetail', this.item);
        },
        deleteProject () {
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.delete(localStorage.getItem('path') + '/projects/project/' + this.item.name, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                    res = JSON.parse(res);
                } catch (error) {console.log(error)}
                console.log(res);

                this.$emit('projectDeleted');
            }, (err) => {
                alert("err");
                alert(err.body);
                console.log(err.body);
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