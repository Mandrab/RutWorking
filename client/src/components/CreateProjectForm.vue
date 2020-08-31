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
                <button v-if="!creating" @click="handleSubmit" class="btn btn-primary" :disabled="creating">Add project</button>
                <button v-if="!creating" @click="closeForm" class="btn btn-link">Cancel</button>
                <font-awesome-icon v-if="creating" style="color: gray;" icon="spinner" pulse size="2x"/>
            </div>
        </form>

        <simpleModal v-if="showModal" :title="title" :message="message" @closeModal="closeModal"></simpleModal>
    </div>
</template>

<script>
import simpleModal from './SimpleModal.vue'

export default {
    data() {
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
            if (this.deadline == '') {
                return;
            }
            var date = new Date(this.deadline);
            date.setHours(23, 59, 59, 999);
            var today = new Date();
            if (date < today) {
                this.deadline = '';
                this.title = 'Choose a date';
                this.message = "Invalid date!";
                this.showModal = true;
            }
        }
    },
    methods: {
        handleSubmit() {
            this.submitted = true;
            if (this.project.projectName && this.project.description && this.deadline) {
                this.addProject(this.project);
            }
        },
        addProject(project) {
            this.creating = true;
            var tokenjson = { headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token } };
            var json = {
                "description": this.project.description,
                "deadline": this.deadline.toString(),
            }

            this.$http.post(localStorage.getItem('path') + '/projects/project/' + project.projectName, json, tokenjson).then(function() {
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
