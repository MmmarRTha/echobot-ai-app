import './style.css'

const form = document.querySelector('#form')

form?.addEventListener('submit', e => {
    e.preventDefault();

    const prompt = document.querySelector<HTMLInputElement>('#prompt')?.value;

    if(prompt?.trim() === '') {
        alert('Query cannot be empty')
        return
    }
})