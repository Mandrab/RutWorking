<template>
    <div v-if="taskReady" class="border border-dark p-3 mt-1 mb-1">
        <div class="row text-left">
            <div class="col-6 col-sm-6 col-md-6 col-xl-6">
                {{ item.assignee }}
            </div>
            <div v-if="isModuleChief" class="col-6 col-sm-6 col-md-6 col-xl-6">
                <button v-if="isModuleChief" class="btn btn-primary">D</button>
            </div>
        </div>
        <div class="row col-12 col-sm-12 col-md-12 col-xl-12">
            {{ item.taskDescription }}
        </div>
        <div class="row col-12 col-sm-12 col-md-12 col-xl-12">
            <div v-if="!isLeftArrowDisabled" class="">
                <button class="btn btn-primary" @click="moveToPreviousStage">L</button>
            </div>
            <div v-if="!isRightArrowDisabled" class="">
                <button class="btn btn-primary" @click="moveToNextStage">R</button>
            </div>
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
            this.isProjectChief = localStorage.getItem('isProjectChief');
            this.isModuleChief = localStorage.getItem('isModuleChief');

            console.log("-----");
            console.log(this.username);
            console.log(this.projectName);
            console.log(this.moduleName);
            console.log(this.isProjectChief);
            console.log(this.isModuleChief);

            if (this.item.status == "DONE") {
                this.isRightArrowDisabled = true;
            }
            if (this.item.status == "TO-DO") {
                this.isLeftArrowDisabled = true;
            }

            this.taskReady = true;
            setTimeout(() => {
                alert(this.isModuleChief);
            }, 2000);
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
            var json = {
                "newState": nextStage,
                "assignee": this.item.assignee
            }
            this.$http.put(localStorage.getItem('path') + '/projects/' + this.projectName + '/modules/' + this.moduleName + '/kanban/' + this.item.id, json, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                    res = JSON.parse(res);
                } catch (error) {console.log(error)}
                console.log(res);

                console.log("INIZIO");
                this.$emit('updateTask');

            }, (err) => {
                alert("err");
                alert(err.body);
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
                this.item.assignee = "";
                console.log("oooooooooo")
                console.log(this.item.assignee);
            }
            var json = {
                "newState": nextStage,
                "assignee": this.item.assignee
            }
            this.$http.put(localStorage.getItem('path') + '/projects/' + this.projectName + '/modules/' + this.moduleName + '/kanban/' + this.item.id, json, tokenJson).then(function(response) {
                console.log(response.body);
                var res = response.body;
                try {//è un livello di sicurezza in più, potrebbe non servire tray atch in futuro
                    res = JSON.parse(res);
                } catch (error) {console.log(error)}
                console.log(res);

                console.log("INIZIO");
                this.$emit('updateTask');

            }, (err) => {
                alert("err");
                alert(err.body);
                console.log(err.body);
                
            });

        },
    }
};
</script>

<style scoped>
.list-group-item:hover {
    background-color: lightgray;
}
</style>