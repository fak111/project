<script setup lang="ts">
import { Question } from '../types/questions';

defineProps<{
  incompleteQuestions: Question[];
}>();
</script>

<template>
  <div v-if="incompleteQuestions.length > 0" class="validation-message">
    <h3>Please complete all questions before submitting:</h3>
    <ul>
      <li v-for="question in incompleteQuestions" :key="question.id">
        <span class="serial-number">{{ question.serialNumber }}:</span>
        {{ question.text }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.validation-message {
  background-color: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

h3 {
  color: #d32f2f;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

ul {
  margin: 0;
  padding-left: 1.5rem;
}

li {
  color: #555;
  margin-bottom: 0.5rem;
}

.serial-number {
  font-weight: bold;
  color: #d32f2f;
}
</style>