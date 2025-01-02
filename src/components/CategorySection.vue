<script setup lang="ts">
import { Question, Category, FriendResponse } from '../types/questions';
import QuestionCard from './QuestionCard.vue';

defineProps<{
  category: Category;
  questions: Question[];
}>();

const emit = defineEmits<{
  (e: 'update:question', question: Question): void;
}>();

const updateQuestion = (question: Question, field: 'answer' | 'elaboration' | 'friendResponses', value: any) => {
  emit('update:question', { ...question, [field]: value });
};
</script>

<template>
  <section class="category-section">
    <h2>{{ category.title }}</h2>
    <p class="description">{{ category.description }}</p>
    
    <div class="questions">
      <QuestionCard
        v-for="question in questions"
        :key="question.id"
        :question="question"
        @update:answer="(value) => updateQuestion(question, 'answer', value)"
        @update:elaboration="(value) => updateQuestion(question, 'elaboration', value)"
        @update:friendResponses="(value) => updateQuestion(question, 'friendResponses', value)"
      />
    </div>
  </section>
</template>

<style scoped>
.category-section {
  margin-bottom: 2rem;
}

h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.description {
  color: #666;
  margin-bottom: 1.5rem;
}

.questions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>