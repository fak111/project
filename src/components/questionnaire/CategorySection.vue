<template>
    <div class="category-section">
        <h2>{{ category.name }}</h2>
        <div class="questions">
            <div v-for="question in questions" :key="question.id" class="question">
                <p>{{ question.text }}</p>
                <textarea v-model="answers[question.id]" @input="handleAnswer(question.id)" placeholder="请输入您的答案..."
                    rows="3"></textarea>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
    category: {
        type: Object,
        required: true
    },
    questions: {
        type: Array,
        required: true
    }
})

const emit = defineEmits(['answer-updated'])
const answers = ref({})

const handleAnswer = (questionId) => {
    emit('answer-updated', {
        questionId,
        answer: answers.value[questionId]
    })
}
</script>

<style scoped>
.category-section {
    margin-bottom: 30px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
    color: #4f46e5;
    margin-bottom: 20px;
}

.question {
    margin-bottom: 20px;
}

.question p {
    margin-bottom: 10px;
    font-weight: 500;
}

textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    resize: vertical;
    font-family: inherit;
}

textarea:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}
</style>
