# StayVerify 🏨🛡️

> **Hotel Listing Scam & Authenticity Detector for Google Hotels.**

StayVerify is an intelligent tool designed to protect travelers from fraudulent hotel listings and scams on Google Hotels. By combining a Next.js backend with a seamless Chrome extension, StayVerify analyzes hotel listings in real-time, leveraging AI, computer vision, and domain intelligence to verify the authenticity of a property before you book.

---

## 🌟 Features

- **Real-Time Analysis**: Instantly analyzes Google Hotels listings directly on the page.
- **Image Verification**: Uses Google Cloud Vision to detect stock photos, doctored images, or images used across multiple suspicious listings.
- **Domain Intelligence**: Performs WHOIS lookups to verify the age, ownership, and legitimacy of the hotel's official website.
- **AI-Powered Insights**: Utilizes Hugging Face transformers and AI models to analyze reviews, descriptions, and listing metadata for scam patterns.
- **Seamless Integration**: A lightweight Chrome extension that works quietly in the background, adding visual indicators to legitimate and suspicious listings.

---

## 🏗️ Architecture

StayVerify consists of two main components:

1. **The Backend (Next.js)**
   Located in the `src/` directory. This is the powerhouse that handles API requests from the extension. It orchestrates Puppeteer for data gathering, runs signal detectors (Vision, WHOIS), and aggregates the state. It then utilizes **typesafe-ai/jev** (`experimental_evaluate` from the Vercel AI SDK) to evaluate this state against strict criteria, returning deterministic, type-safe JSON for the extension.

2. **The Extension (Chrome Manifest V3)**
   Located in the `extension/` directory. A lightweight content script that injects non-intrusive UI elements into Google Hotels, communicating with the backend to retrieve and display trust scores.

---

## 🦸‍♂️ The Hero of the Stack: Jev

While traditional AI applications rely on massive, conversational LLMs that require endless prompt engineering and are prone to hallucinations (like returning invalid JSON), **StayVerify uses Jev (`typesafe-ai/jev`) as its brain.**

Jev is a specialized, type-safe evaluator that takes the chaos out of AI decision-making. Here is why Jev is the hero of our architecture:

1. **State-Driven, Not Prompt-Driven**: Instead of feeding a model messy HTML or paragraphs of text, our backend first runs dedicated computer vision and heuristic detectors. It compiles these signals into a clean, structured JSON `state` object.
2. **Ironclad Type Safety**: Jev evaluates this `state` against strict, predefined criteria (e.g., scoring risk on a scale, or choosing from a strict set of enums). The output is mathematically guaranteed to match the expected schema—meaning the Chrome extension will *never* crash due to a malformed AI response.
3. **Built-in Uncertainty Flagging**: Jev evaluates edge cases with a `needs_human_review` boolean flag. If the AI is uncertain or lacks sufficient data, the listing is deterministically routed to a human reviewer rather than blindly guessing.
4. **Determinism at the Edge**: By removing the conversational fluff and focusing purely on state evaluation, Jev makes StayVerify incredibly fast, cheap, and reliable enough to run on every single hotel listing a user browses.

In short, Jev transforms fuzzy, unpredictable AI logic into a rock-solid, enterprise-grade decision engine.

---

## 🚀 Getting Started

Follow these instructions to get the StayVerify backend and extension running locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- Google Cloud Platform account (for Vision API access)
- npm or yarn

### 1. Backend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key_here
   # Add any other required AI API keys (e.g., OpenAI, Hugging Face)
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The backend will start on `http://localhost:3000`.

### 2. Extension Setup

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right corner).
3. Click on **Load unpacked**.
4. Select the `extension/` folder located in the StayVerify project directory.
5. The StayVerify extension should now be visible in your list of extensions.

---

## 💡 How to Use

1. Ensure the Next.js backend is running (`npm run dev`).
2. Make sure the Chrome extension is loaded and active.
3. Go to [Google Hotels](https://www.google.com/travel/hotels).
4. Search for a destination and click on any hotel listing.
5. StayVerify will automatically run its checks and display an authenticity badge/score directly on the hotel's page, warning you of potential red flags or confirming the listing's legitimacy.

---

## 🛠️ Technologies Used

- **Framework**: Next.js (React)
- **Extension**: Chrome Manifest V3 (JavaScript, CSS)
- **Web Scraping**: Puppeteer
- **Computer Vision**: `@google-cloud/vision`
- **AI/ML**: `typesafe-ai/jev` (for strict, type-safe state evaluation), `@xenova/transformers`, `ai`
- **Domain Tools**: `whois-json`
- **Icons**: Lucide React

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📝 License

This project is private and intended for demonstration/development purposes.
