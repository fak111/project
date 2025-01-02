<script setup lang="ts">
import { Question, FriendResponse } from '../types/questions';
import FriendQuestionCard from './FriendQuestionCard.vue';

const props = defineProps<{
  question: Question;
}>();

const emit = defineEmits<{
  (e: 'update:answer', value: string): void;
  (e: 'update:elaboration', value: string): void;
  (e: 'update:friendResponses', responses: FriendResponse[]): void;
}>();

const handleYesClick = () => {
  emit('update:answer', 'yes');
};
</script>

<template>
  <div class="question-card">
    <h3>
      <span class="serial-number">{{ question.serialNumber }}.</span>
      {{ question.text }}
    </h3>
    
    <div v-if="question.requiresFriendInput" class="friend-input-notice">
      This question requires input from your friends
    </div>
    
    <div class="answer-section">
      <button 
        class="yes-button"
        :class="{ 'selected': question.answer === 'yes' }"
        @click="handleYesClick"
      >
        Yes
      </button>
      
      <textarea
        v-if="question.answer === 'yes' && !question.requiresFriendInput"
        :value="question.elaboration"
        @input="emit('update:elaboration', ($event.target as HTMLTextAreaElement).value)"
        placeholder="Please elaborate on your answer..."
        rows="4"
      ></textarea>
      
      <FriendQuestionCard
        v-if="question.requiresFriendInput && question.answer === 'yes'"
        :question="question"
        @update:friendResponses="emit('update:friendResponses', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.question-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.friend-input-notice {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 0.5rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.serial-number {
  color: #42b883;
  font-weight: bold;
  margin-right: 0.5rem;
}

.answer-section {
  margin-top: 1rem;
}

.yes-button {
  background-color: #fff;
  border: 2px solid #42b883;
  color: #42b883;
  padding: 0.5rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.yes-button.selected {
  background-color: #42b883;
  color: white;
}

.yes-button:hover {
  background-color: #42b883;
  color: white;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  margin-top: 1rem;
}

h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #2c3e50;
  display: flex;
  align-items: flex-start;
}
</style>