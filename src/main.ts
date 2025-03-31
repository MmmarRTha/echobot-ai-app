import './style.css';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({
    apiKey: import.meta.env.VITE_OPENROUTER_KEY
})

const app = document.querySelector('#app')
const submitBtn = document.querySelector('#submit') as HTMLButtonElement
const form = document.querySelector('#form')
const modelSelect = document.querySelector('#model-select') as HTMLSelectElement

form?.addEventListener('submit', async e => {
    e.preventDefault();

    const prompt = document.querySelector<HTMLInputElement>('#prompt')?.value;

    if(prompt?.trim() === '') {
        alert('Query cannot be empty')
        return
    }

    submitBtn!.disabled = true
    const result = streamText({
        model: openrouter(modelSelect.value),
        temperature: 0,
        prompt
    })

    while(app?.firstChild) {
        app.removeChild(app.firstChild)
    }

    app?.classList.remove('hidden')
    const timestamp = document.createElement('div')
    timestamp.className = 'text-sm text-gray-400 mb-2'
    const now = new Date()
    timestamp.textContent = now.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
    app?.appendChild(timestamp)
    
    for await ( const text of result.textStream ) {
        app?.append(text)
    }
    submitBtn.disabled = false
})