<template>
    <div class="col-sm-6 offset-sm-3">
        <h2>Create project</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" v-model="project.projectName" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
                <div v-if="submitted && errors.has('name')" class="invalid-feedback">{{ errors.first('name') }}</div>
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <textarea rows=5 columns=10 v-model="project.description" v-validate="'required'" name="description" class="form-control" :class="{ 'is-invalid': submitted && errors.has('description') }" />
                <div v-if="submitted && errors.has('description')" class="invalid-feedback">{{ errors.first('description') }}</div>
            </div>
            <div class="form-group">
                <label for="deadline">Deadline</label>
                <input type="date" v-model="deadline" v-validate="'required'" name="deadline" class="form-control" :class="{ 'is-invalid': submitted && errors.has('deadline') }" />
                <div v-if="submitted && errors.has('deadline')" class="invalid-feedback">{{ errors.first('deadline') }}</div>
            </div>
            <div class="form-group">
                <button @click="handleSubmit" class="btn btn-primary" :disabled="creating">Add Project</button>
                <img v-show="creating" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                <button @click="closeForm" class="btn btn-link">Cancel</button>
            </div>
        </form>
    </div>
</template>

<script>

export default {
    data () {
        return {
            project: {
                projectName: '',
                description: '',
            },
            deadline: '',
            submitted: false,
            creating: false,
        }
    },
    watch: {
        deadline: function () {
            var date = new Date(this.deadline);
            var today = new Date();
            if (date<today) {
                this.deadline = '';
                alert("Invalid date!");
            }
        }
    },
    computed: {
        
    },
    methods: {
        
        handleSubmit() {
            this.submitted = true;
            this.$validator.validate().then(valid => {
                if (valid) {
                    this.addProject(this.project);
                }
            });
           //this.addProject(this.project);
        },
        addProject (project) {
            this.creating = true;
            var vm = this;
            var tokenjson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            var json = {
                "description": this.project.description,
                "deadline": this.deadline.toString(),
            }
            vm.$http.post(localStorage.getItem('path') + '/projects/project/' + project.projectName, json, tokenjson).then(function(response) {
                console.log(response.body);
                console.log(this.creating);
                //mando un emit al padre con il progetto appena creato
                //var myEmail = localStorage.getItem
                /*var project =   {
                                    "name": project.projectName,
                                    "chief": "prova@gmail.com",
                                    "modules": [],
                                    "description": "descrizione progetto 4",
                                    "deadline": "2020-09-27T00:00:00.000Z"
                                }*/
                this.$emit('projectAdded');
                this.closeForm();
            }, (err) => {
                alert(err);
                console.log(err);
                console.log(err.body);
                this.creating = false;
            });
        },
        closeForm () {
            this.creating = false;
            this.$emit('hide'); // notifico il padre
        }
    }
};
</script>
