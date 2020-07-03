<template>
    <div class="col-sm-6 offset-sm-3">
        <h2>Create Project</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="project-name">Project Name</label>
                <input type="text" v-model="project.projectName" v-validate="'required'" name="project-name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('project-name') }" />
                <div v-if="submitted && errors.has('project-name')" class="invalid-feedback">{{ errors.first('project-name') }}</div>
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <input type="textarea" v-model="project.description" v-validate="'required'" name="description" class="form-control" :class="{ 'is-invalid': submitted && errors.has('description') }" />
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
            if (date.getFullYear() < today.getFullYear() || date.getMonth() < today.getMonth() || date.getDate() < today.getDate()) {
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
            var json = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            vm.$http.post(localStorage.getItem('path') + '/projects/' + project.projectName, {}, json).then(function(response) {
                console.log(response.body);
                console.log(this.creating);
                this.closeForm();
                console.log(this.creating);
            }, (err) => {
                alert(err);
                console.log(err.body);
                this.creating = false;
            });
        },
        closeForm () {
            this.creating = false;
            this.$emit('done'); // notifico il padre
        }
    }
};
</script>
