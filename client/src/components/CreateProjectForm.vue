<template>
    <div class="col-sm-6 offset-sm-3">
        <h2>Create project</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" v-model="project.projectName" name="name" class="form-control" :class="{ 'is-invalid': submitted && !project.projectName }" />
                <div v-show="submitted && !project.projectName" class="invalid-feedback">Name is required</div>
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <textarea rows=5 columns=10 v-model="project.description" name="description" class="form-control" :class="{ 'is-invalid': submitted && !project.description }" />
                <div v-show="submitted && !project.description" class="invalid-feedback">Description is required</div>
            </div>
            <div class="form-group">
                <label for="deadline">Deadline</label>
                <input type="date" v-model="deadline" name="deadline" class="form-control" :class="{ 'is-invalid': submitted && !deadline }" />
                <div v-show="submitted && !deadline" class="invalid-feedback">Deadline is required</div>
            </div>
            <div class="form-group">
                <button @click="handleSubmit" class="btn btn-primary" :disabled="creating">Add project</button>
                <img v-show="creating" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                <button @click="closeForm" class="btn btn-link">Cancel</button>
            </div>
        </form>

        <simpleModal v-if="showModal" :title="title" :message="message" @closeModal="closeModal"></simpleModal>
    </div>
</template>

<script>
import simpleModal from './SimpleModal.vue'

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
            showModal: false,
            title: '',
            message: ''
        }
    },
    components: {
        simpleModal
    },
    watch: {
        deadline: function () {
            var date = new Date(this.deadline);
            var today = new Date();
            if (date < today) {
                this.deadline = '';
                this.title = 'Choose a date';
                this.message = "Invalid date!";
                this.showModal = true;
            }
        }
    },
    computed: {
    },
    methods: {
        handleSubmit() {
            this.submitted = true;
            if (this.project.projectName && this.project.description && this.deadline) {
                this.addProject(this.project);
            }
        },
        addProject (project) {
            this.creating = true;
            var tokenjson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            var json = {
                "description": this.project.description,
                "deadline": this.deadline.toString(),
            }
            this.$http.post(localStorage.getItem('path') + '/projects/project/' + project.projectName, json, tokenjson).then(function(response) {
                console.log(response.body);

                this.$emit('projectAdded');
                this.closeForm();
            }, (err) => {
                console.log(err.body);
                this.showModal = true;
                this.title = 'Error';
                this.message = err.body;
                this.creating = false;
            });
        },
        closeForm () {
            this.creating = false;
            this.$emit('hide');
        },
        closeModal() {
            this.showModal = false;
        }
    }
};
</script>
