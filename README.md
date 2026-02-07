# AI EchoBot - Interactive AI Chat Application

A modern, responsive AI chat application that leverages multiple state-of-the-art language models through OpenRouter's API. With a Live Weather Widget powered by an MCP server built from scratch. Tech Stack: Html, Css, TypeScript, Vite, and Tailwind CSS.

## 🌟 Features

- **Multi-Model Support**: Seamlessly switch between different AI models:
  - Meta Llama 3 70B
  - Google Gemma 3 27B
  - DeepSeek R1 0528
  - Mistral Small 24B
  - OpenAI GPT-OSS 120B

- **Real-time Streaming**: Experience instant responses with streaming text output
- **Modern UI/UX**: 
  - Responsive design for all devices
  - Beautiful gradient backgrounds
  - Animated UI elements
  - Dark mode optimized
- **Developer Experience**:
  - TypeScript for type safety
  - Vite for fast development
  - Tailwind CSS for styling
  - Environment variable support
- **Live Weather Widget**: Real-time weather information for your current or selected city, powered by the MCP server and Open-Meteo API. The widget is always visible at the bottom-right of the app.

## 🚀 Tech Stack

- **Frontend Framework**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenRouter API
- **Build Tools**: Vite
- **Package Manager**: pnpm
- **Weather Integration**:
  - **MCP Server**: Handles weather data requests and validation
  - **Weather API**: Open-Meteo API for geocoding and weather forecasts
  - **Validation**: Zod for runtime API response validation
  - **UI**: Weather widget with animated, responsive design, always visible at the bottom-right
> The project includes a `.tool-versions` file for automatic Node version management via asdf.

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/echobot-ai-app.git
cd echobot-ai-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory:
```env
VITE_OPENROUTER_KEY=your_openrouter_api_key
```

4. Start the development server:
```bash
pnpm run dev
```

## 🔧 Usage

1. Select your preferred AI model from the dropdown
2. Type your question in the input field
3. Click the send button or press Enter
4. Watch as the AI responds in real-time

### Weather Widget

1. The weather widget automatically fetches your location (with permission) and displays current weather for your city.
2. You can change the city using the widget's interface.
3. Weather data is fetched via the MCP server, which validates responses for safety and reliability.
4. The widget is always accessible at the bottom-right of the app.

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop browsers
- Tablets
- Mobile devices

## 🔒 Security

- API keys are stored securely in environment variables
- No sensitive data is stored locally
- HTTPS support for secure communication

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenRouter for providing access to various AI models
- Vite team for the amazing build tool
- Tailwind CSS team for the utility-first CSS framework

---

Made with ❤️ by Martha M. Nieto
