<template>
    <li class="list-group-item" @click="open" :isMember="isModulesMember"> 
        <div class="row">
            <div class="col-9 col-sm-9 col-md-9 col-xl-9 font-weight-bold h5 text-left">
                {{ item.name }}
            </div>
            <div class="col-3 col-sm-3 col-md-3 col-xl-3 text-right">
                <div v-if="isProjectChief" @click="deleteProject" class="delete-btn"><font-awesome-icon class="delete-icon" icon="trash-alt" size="lg"/></div>
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
            isProjectChief: false,
            isModulesMember: [],
            projectIndexInList: 0
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
        
        console.log(this.isMember)
        this.isModulesMember = this.isMember;
        this.projectIndexInList = this.index;
        console.log("PT");
        console.log(this.isModulesMember);
    },
    props: {
        item: {
            type: Object
        },
        isMember: {
            type: Array
        },
        index: {
            type: Number
        },
        page: {
            type: Number
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
            this.$emit('openDetail', this.item, this.projectIndexInList + this.page);
        },
        deleteProject () {
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.delete(localStorage.getItem('path') + '/projects/project/' + this.item.name, tokenJson).then(function(response) {
                console.log(response.body);

                this.$emit('projectDeleted');
            }, (err) => {
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

.delete-btn {
    position: absolute;
    top: 1px;
    right: 2px;
    color: #be0000;
    background-color: none;
    cursor: pointer;
}

.delete-icon:hover {
    color: #a50000;
}

.delete-icon {
    position: absolute;
    top: 1px;
    right: 2px;
    padding: 0px;
    margin: 0px;
    color: #be0000;
}
</style>