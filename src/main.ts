// Selectors and class names as constants
const APP_SELECTOR = "#app";
const SUBMIT_BTN_SELECTOR = "#submit";
const FORM_SELECTOR = "#form";
const MODEL_SELECT_SELECTOR = "#model-select";
const CLEAR_BTN_SELECTOR = "#clear-input";
const PROMPT_INPUT_SELECTOR = "#prompt";
const WEATHER_CONTAINER_SELECTOR = "#weather-container";
const FOOTER_PHRASE_ID = "footer-phrase";

const SHAKE_CLASS = "shake";
const HIDDEN_CLASS = "hidden";
const OPACITY_50_CLASS = "opacity-50";

import "./style.css";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { WeatherWidget } from "./weather/weatherWidget";

const app = document.querySelector(APP_SELECTOR);
const submitBtn = document.querySelector(
  SUBMIT_BTN_SELECTOR
) as HTMLButtonElement | null;
const form = document.querySelector(FORM_SELECTOR);
const modelSelect = document.querySelector(
  MODEL_SELECT_SELECTOR
) as HTMLSelectElement | null;
const clearBtn = document.querySelector(
  CLEAR_BTN_SELECTOR
) as HTMLButtonElement | null;
const promptInput = document.querySelector<HTMLTextAreaElement>(
  PROMPT_INPUT_SELECTOR
);

// Early null check for all required elements
if (!app || !submitBtn || !form || !modelSelect || !clearBtn || !promptInput) {
  console.error("Critical UI element(s) missing. App cannot start.");
  throw new Error("Critical UI element(s) missing.");
}

const openrouter = createOpenRouter({
  apiKey: import.meta.env.VITE_OPENROUTER_KEY,
});

// Weather widget initialization
const weatherContainer = document.querySelector(WEATHER_CONTAINER_SELECTOR);
let weatherWidget: WeatherWidget | null = null;

if (weatherContainer instanceof HTMLElement) {
  weatherWidget = new WeatherWidget(weatherContainer);
  weatherWidget.initialize();
}

// Auto-resize textarea
const resizeTextarea = () => {
  promptInput.style.height = "auto";
  promptInput.style.height = promptInput.scrollHeight + "px";
};

// Event handler for prompt input keydown
function handlePromptKeydown(e: KeyboardEvent) {
  if (!submitBtn || !form) return;
  if (e.key === "Enter" && !e.shiftKey && !submitBtn.disabled) {
    e.preventDefault();
    form.dispatchEvent(new Event("submit"));
  }
}

// Event handler for clear button click
function handleClearBtnClick() {
  if (!promptInput) return;
  promptInput.value = "";
  promptInput.style.height = "auto";
  promptInput.focus();
}

// Error message rendering
function renderErrorMessage(message: string) {
  if (!app) return;
  while (app.firstChild) {
    app.removeChild(app.firstChild);
  }
  app.classList.remove(HIDDEN_CLASS);
  const errorDiv = document.createElement("div");
  errorDiv.className = "text-red-600 bg-red-100 p-2 rounded mb-2";
  errorDiv.textContent = message;
  app.appendChild(errorDiv);
}

// Handle form submission
const handleSubmit = async (e?: Event) => {
  if (e) e.preventDefault();

  const prompt = promptInput.value;

  if (!prompt.trim()) {
    promptInput.classList.add(SHAKE_CLASS);
    setTimeout(() => promptInput.classList.remove(SHAKE_CLASS), 500);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.classList.add(OPACITY_50_CLASS);

  try {
    const result = streamText({
      model: openrouter(modelSelect.value),
      temperature: 0,
      prompt,
    });

    while (app.firstChild) {
      app.removeChild(app.firstChild);
    }

    app.classList.remove(HIDDEN_CLASS);
    const timestamp = document.createElement("div");
    timestamp.className = "text-sm text-gray-400 mb-2";
    const now = new Date();
    timestamp.textContent = now.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    app.appendChild(timestamp);

    for await (const text of result.textStream) {
      app.append(text);
    }

    promptInput.value = "";
    resizeTextarea();
  } catch (error) {
    renderErrorMessage(
      error instanceof Error
        ? `An error occurred: ${error.message}`
        : "An unknown error occurred."
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove(OPACITY_50_CLASS);
  }
};

// Event Listeners
promptInput.addEventListener("input", resizeTextarea);
promptInput.addEventListener("keydown", handlePromptKeydown);
clearBtn.addEventListener("click", handleClearBtnClick);
form.addEventListener("submit", handleSubmit);

const phrases = [
  "Made with \u2764\ufe0f and a dash of magic",
  "Powered by purrs, code, and creativity \ud83d\udc3e\u2728",
  "Developed with love, coffee, and cat cuddles \u2615\ud83d\udc08",
  "Coded under the watchful eyes of my feline supervisor \ud83d\udc31",
  "Just another pixel-perfect dream in code \ud83d\udcad\ud83d\udcbb",
  "Programming with a cat on my lap and coffee in hand \ud83d\udc3e\u2615",
  "Dreamed, built, and launched with a spark \ud83d\ude80",
  "Fueled by coffee, curiosity, and paw-sitive vibes \ud83d\udc3e\u2600\ufe0f",
  "Debugging with a sidekick on my keyboard \ud83d\udc3e\u2328\ufe0f",
  "From cat naps to code maps \u2014 always building \ud83d\udca4\u27a1\ufe0f\ud83d\udca1",
];
const selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];
const currentYear = new Date().getFullYear();

const footerPhrase = document.getElementById(FOOTER_PHRASE_ID);
if (footerPhrase) {
  footerPhrase.textContent = `${currentYear}. ${selectedPhrase}`;
}
