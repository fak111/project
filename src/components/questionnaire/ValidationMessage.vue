<template>
    <div class="validation-message" :class="{ 'valid': isValid }">
        <p>{{ message }}</p>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    isValid: {
        type: Boolean,
        required: true
    }
})

const message = computed(() => {
    return props.isValid ? '所有问题已完成！' : '请完成所有问题后再提交。'
})
</script>

<style scoped>
.validation-message {
    margin: 20px 0;
    padding: 12px;
    border-radius: 6px;
    text-align: center;
    background-color: #fee2e2;
    color: #dc2626;
}

.validation-message.valid {
    background-color: #dcfce7;
    color: #16a34a;
}
</style>
