<script setup lang="ts">
import { ref } from 'vue';
import { ShareableLink } from '../types/questions';

const props = defineProps<{
  link: ShareableLink;
}>();

const copied = ref(false);

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.link.url);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy link:', err);
  }
};
</script>

<template>
  <div class="shareable-link">
    <div class="link-display">
      <span class="link-text">{{ link.url }}</span>
      <button @click="copyLink" class="copy-button">
        {{ copied ? 'Copied!' : 'Copy Link' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.shareable-link {
  margin-top: 0.5rem;
}

.link-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0f0f0;
  padding: 0.5rem;
  border-radius: 4px;
}

.link-text {
  font-size: 0.9rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
}

.copy-button:hover {
  background-color: #3aa876;
}
</style>