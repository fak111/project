<script setup lang="ts">
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { Question, FriendResponse, ShareableLink } from '../types/questions';
import ShareableLinkComponent from './ShareableLink.vue';

const props = defineProps<{
  question: Question;
}>();

const emit = defineEmits<{
  (e: 'update:friendResponses', responses: FriendResponse[]): void;
}>();

const baseUrl = window.location.origin;
const maxFriends = 10;

const generateShareableLink = (): ShareableLink => {
  const id = uuidv4();
  return {
    id,
    questionIds: [props.question.id],
    url: `${baseUrl}/friend-response/${id}`
  };
};

const addNewLink = () => {
  const currentResponses = props.question.friendResponses || [];
  if (currentResponses.length < maxFriends) {
    const newResponse: FriendResponse = {
      id: uuidv4(),
      elaboration: '',
      completed: false,
      shareableLink: generateShareableLink()
    };
    
    const updatedResponses = [...currentResponses, newResponse];
    emit('update:friendResponses', updatedResponses);
  }
};
</script>

<template>
  <div class="friend-question-card">
    <div class="friend-responses">
      <div v-for="response in question.friendResponses" :key="response.id" class="response-item">
        <div class="response-status" :class="{ completed: response.completed }">
          {{ response.completed ? 'Completed' : 'Pending' }}
        </div>
        <ShareableLinkComponent 
          v-if="!response.completed && response.shareableLink"
          :link="response.shareableLink"
        />
        <p v-if="response.completed" class="response-text">
          {{ response.elaboration }}
        </p>
      </div>
    </div>
    
    <button 
      @click="addNewLink"
      class="add-friend-button"
      :disabled="(question.friendResponses?.length || 0) >= maxFriends"
    >
      Share with a friend ({{ question.friendResponses?.length || 0 }}/{{ maxFriends }})
    </button>
  </div>
</template>

<style scoped>
.friend-question-card {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.friend-responses {
  margin-bottom: 1rem;
}

.response-item {
  background: #f8f8f8;
  padding: 0.8rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.response-status {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.response-status.completed {
  color: #42b883;
}

.response-text {
  margin: 0;
  color: #2c3e50;
}

.add-friend-button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.add-friend-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>