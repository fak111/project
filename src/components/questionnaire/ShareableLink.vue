<template>
    <div class="shareable-link">
        <input type="text" :value="shareUrl" readonly />
        <button @click="copyLink">复制链接</button>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    link: {
        type: Object,
        required: true
    }
})

const shareUrl = computed(() => {
    return `${window.location.origin}/friend-response/${props.link.id}`
})

const copyLink = () => {
    navigator.clipboard.writeText(shareUrl.value)
    alert('链接已复制到剪贴板')
}
</script>

<style scoped>
.shareable-link {
    display: flex;
    gap: 10px;
}

input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 14px;
    background: #f9fafb;
    cursor: text;
}

button {
    padding: 8px 16px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

button:hover {
    background: #4338ca;
}
</style>
