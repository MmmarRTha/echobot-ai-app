import "./style.css";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { WeatherWidget } from "./weather/weatherWidget";

const openrouter = createOpenRouter({
  apiKey: import.meta.env.VITE_OPENROUTER_KEY,
});

const app = document.querySelector("#app");
const submitBtn = document.querySelector("#submit") as HTMLButtonElement;
const form = document.querySelector("#form");
const modelSelect = document.querySelector(
  "#model-select"
) as HTMLSelectElement;
const clearBtn = document.querySelector("#clear-input") as HTMLButtonElement;
const promptInput = document.querySelector<HTMLTextAreaElement>("#prompt");

// Weather widget initialization
const weatherContainer = document.querySelector("#weather-container");
let weatherWidget: WeatherWidget | null = null;

if (weatherContainer instanceof HTMLElement) {
  weatherWidget = new WeatherWidget(weatherContainer);
  weatherWidget.initialize();
}

// Auto-resize textarea
const resizeTextarea = () => {
  if (promptInput) {
    promptInput.style.height = "auto";
    promptInput.style.height = promptInput.scrollHeight + "px";
  }
};

// Handle form submission
const handleSubmit = async (e?: Event) => {
  if (e) e.preventDefault();

  const prompt = promptInput?.value;

  if (!prompt?.trim()) {
    promptInput?.classList.add("shake");
    setTimeout(() => promptInput?.classList.remove("shake"), 500);
    return;
  }

  submitBtn!.disabled = true;
  submitBtn!.classList.add("opacity-50");

  const result = streamText({
    model: openrouter(modelSelect.value),
    temperature: 0,
    prompt,
  });

  while (app?.firstChild) {
    app.removeChild(app.firstChild);
  }

  app?.classList.remove("hidden");
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
  app?.appendChild(timestamp);

  for await (const text of result.textStream) {
    app?.append(text);
  }

  submitBtn!.disabled = false;
  submitBtn!.classList.remove("opacity-50");
  promptInput!.value = "";
  resizeTextarea();
};

// Event Listeners
promptInput?.addEventListener("input", resizeTextarea);

// Add Enter key support
promptInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !submitBtn.disabled) {
    e.preventDefault();
    form?.dispatchEvent(new Event("submit"));
  }
});

clearBtn?.addEventListener("click", () => {
  if (promptInput) {
    promptInput.value = "";
    promptInput.style.height = "auto";
    promptInput.focus();
  }
});

form?.addEventListener("submit", handleSubmit);

const phrases = [
  "Made with ❤️ and a dash of magic",
  "Powered by purrs, code, and creativity 🐾✨",
  "Developed with love, coffee, and cat cuddles ☕🐈",
  "Coded under the watchful eyes of my feline supervisor 🐱",
  "Just another pixel-perfect dream in code 💭💻",
  "Programming with a cat on my lap and coffee in hand 🐾☕",
  "Dreamed, built, and launched with a spark 🚀",
  "Fueled by coffee, curiosity, and paw-sitive vibes 🐾☀️",
  "Debugging with a sidekick on my keyboard 🐾⌨️",
  "From cat naps to code maps — always building 💤➡️💡",
];
const selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];
const currentYear = new Date().getFullYear();

const footerPhrase = document.getElementById("footer-phrase");
if (footerPhrase) {
  footerPhrase.textContent = `${currentYear}. ${selectedPhrase}`;
}
