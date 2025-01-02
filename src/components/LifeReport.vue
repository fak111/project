<script setup lang="ts">
import { ReportSection } from '../utils/reportGenerator';

defineProps<{
  sections: ReportSection[];
}>();
</script>

<template>
  <div class="life-report">
    <h2>Your Life Report</h2>
    <div v-for="section in sections" :key="section.category" class="report-section">
      <h3 class="section-title">{{ section.category }}</h3>
      <div v-for="answer in section.answers" :key="answer.serialNumber" class="report-item">
        <div class="question">
          <span class="serial-number">{{ answer.serialNumber }}.</span>
          {{ answer.question }}
        </div>
        <p class="elaboration">{{ answer.elaboration }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.life-report {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.report-section {
  margin-bottom: 2rem;
}

.report-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #42b883;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
}

.report-item {
  margin-bottom: 1.5rem;
}

.question {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.serial-number {
  color: #42b883;
  margin-right: 0.5rem;
}

.elaboration {
  color: #2c3e50;
  line-height: 1.6;
  margin: 0;
  padding-left: 1.5rem;
}
</style>