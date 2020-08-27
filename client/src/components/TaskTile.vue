<template>
<div>
    <div v-if="taskReady" class="row border border-dark p-0 mt-1 mb-1">
        <button v-if="!isLeftArrowDisabled" style="font-size: auto; border-left: 0px; border-top: 0px; border-bottom: 0px; border-right: solid 1px;"  class="col-1 p-0 m-0"  @click="moveToPreviousStage"><font-awesome-icon icon="angle-left" size="" /></button>
        <div v-if="isLeftArrowDisabled"  class="col-1 p-0"></div>
        <div class="col-10">
            <div class="row">
                <div style="font-size: 18px; font-weight: bold; " class="cropTitle text-left col-12">
                    {{ item.name }}
                </div>
                <div style="font-size:9px;" class=" crop text-left col-12">
                    {{ item.assignee }}
                </div>
                <div style="font-size: 14px; line-height:normal;"  class="col-12 col-sm-12 col-md-12 col-xl-12">
                    {{ item.taskDescription }}
                </div>
                <div v-if="isModuleChief" @click="deleteTask" class="deletebtn"> <font-awesome-icon class="deleteIcon" icon="trash-alt" size="xs" /> </div>
            </div>
        </div>
        <div v-if="isRightArrowDisabled" class="col-1 p-0"></div>
        <button v-if="!isRightArrowDisabled" style="font-size: auto; border-right: 0px; border-top: 0px; border-bottom: 0px; border-left: solid 1px;" class="col-1 p-0 m-0" @click="moveToNextStage"><font-awesome-icon icon="angle-right" size="" /></button>
    </div>
</div>
</template>

<script>
export default {
    data () {
        return {
          username: '',
          projectName: '',
          moduleName: '',
          isProjectChief: false,
          isModuleChief: false,
          isLeftArrowDisabled: false,
          isRightArrowDisabled: false,
          taskReady: false,
          initialized: false
        }
    },
    created () {
        console.log(this.item);
        this.init();
    },
    props: {
        item: {
            type: Object
        }
    },
    methods: {
        init () {
            this.username = JSON.parse(localStorage.getItem('user')).email;
            this.projectName = localStorage.getItem('projectName');
            this.moduleName = localStorage.getItem('moduleName');
            
            
            var value = localStorage.getItem('isModuleChief');
            if (value == "true"){
                this.isModuleChief = true;
            }else{
            this.isModuleChief = false;
            }

            value = localStorage.getItem('isProjectChief');
            if (value == "true"){
                this.isProjectChief = true;
            }else{
                this.isProjectChief = false;
            }

            console.log("-----");
            console.log(this.username);
            console.log(this.projectName);
            console.log(this.moduleName);
            console.log(this.isProjectChief);
            console.log(this.isModuleChief);

            if (this.item.status == "DONE" || (this.item.assignee != this.username && this.item.status != "TO-DO")) {
                this.isRightArrowDisabled = true;
            }
            if(this.isModuleChief && (this.item.status != "DONE" )){
                //ABILITO
                this.isRightArrowDisabled = false;
            }
            if (this.item.status == "TO-DO" || this.item.assignee != this.username) {
                this.isLeftArrowDisabled = true;
            }
            if(this.isModuleChief && (this.item.status != "TO-DO" )){
                //ABILITO
                this.isLeftArrowDisabled = false;
            }

            this.taskReady = true;
        },
        moveToNextStage () {
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            var nextStage = '';
            switch (this.item.status) {
                case "TO-DO":
                    nextStage = "ASSIGNED";
                    break;
                case "ASSIGNED":
                    nextStage = "IN-PROGRESS";
                break;
                case "IN-PROGRESS":
                    nextStage = "DONE";
                    break;
                case "DONE":
                    nextStage = "DONE";
                    break;
                default:
                    nextStage = this.item.status;
            }

            // se il task non e' assegnato a nessuno, l'assegnatario diventa colui che preme il pulsante "right" (passando da TO-DO a ASSIGNED)
            if (this.item.assignee == null) {
                this.item.assignee = this.username;
            }
            var json = {
                "newState": nextStage,
                "assignee": this.item.assignee
            }

            this.$http.put(localStorage.getItem('path') + '/projects/' + this.projectName + '/modules/' + this.moduleName + '/kanban/' + this.item.id, json, tokenJson).then(function(response) {
                console.log(response.body);
                
                this.$emit('updateTask');

            }, (err) => {
                console.log(err.body);
            });
        },
        moveToPreviousStage () {
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            var nextStage = '';
            switch (this.item.status) {
                case "ASSIGNED":
                    nextStage = "TO-DO";
                break;
                case "IN-PROGRESS":
                    nextStage = "ASSIGNED";
                    break;
                case "DONE":
                    nextStage = "IN-PROGRESS";
                    break;
                default:
                    nextStage = this.item.status;
            }
            if (nextStage == "TO-DO") {
                this.item.assignee = null;
            }
            var json = {
                "newState": nextStage,
                "assignee": this.item.assignee
            }
            this.$http.put(localStorage.getItem('path') + '/projects/' + this.projectName + '/modules/' + this.moduleName + '/kanban/' + this.item.id, json, tokenJson).then(function(response) {
                console.log(response.body);
 
                this.$emit('updateTask');

            }, (err) => {
                console.log(err.body);
            });

        },
        deleteTask() {
            var tokenJson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };

            this.$http.delete(localStorage.getItem('path') + '/projects/' + this.projectName + '/modules/' + this.moduleName + '/kanban/' + this.item.id, tokenJson).then(function(response) {
                console.log(response.body);

                this.$emit('updateTask');
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
.next {
    position: absolute;
    top:0px;
    right:0px;
    height: 100%;
    width: 15%;
    padding: 0px;
    margin: 0px;
    font-size: auto;
}
.previous {
    position: absolute;
    top:0px;
    left:0px;
    height: 100%;
    padding: 0px;
    margin: 0px;
    width: 15%;
    font-size: auto;
}
.deletebtn{
    position: absolute;
    top:0px;
    right:0px;
    height: 15px;
    width: 15px;
    padding: 0px;
    margin: 0px;
    background-color: darkred;
}

.deleteIcon{
    position: absolute;
    top:1px;
    right:2px;
    padding: 0px;
    margin: 0px;
    color: white;
}

.crop{
     text-overflow: ellipsis;
    white-space: nowrap;
    overflow-x: hidden;
    width: 100%;
}

.cropTitle{
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow-x: hidden;
    width: 93%;
}



</style>