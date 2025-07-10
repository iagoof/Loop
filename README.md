# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) Configure `EDGE_CONFIG` in `.env.local` with your Vercel Edge Config connection string to enable persistent storage
4. Run the app:
   `npm run dev`
