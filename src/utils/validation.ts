import type { Question } from '../types/questions'

export function validateQuestions(questions: Question[]) {
    return questions.every(q => q.answer && q.answer.trim() !== '')
}
