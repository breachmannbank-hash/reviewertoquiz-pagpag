# Text to Reviewer

A simple quasi-offline educational web app that turns pasted reviewer text into 5 study questions with answers.

## Files

- `index.html` - app layout
- `style.css` - clean student-friendly styling
- `script.js` - browser logic, offline detection, localStorage, service worker registration
- `server.js` - Node.js and Express backend with `POST /generate`
- `service-worker.js` - basic offline app-shell cache
- `.env.example` - sample environment variables

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in this folder:

   ```env
   OPENAI_API_KEY=your_api_key_here
   OPENAI_MODEL=gpt-5.2
   ```

3. Start the app:

   ```bash
   npm start
   ```

4. Open:

   ```text
   http://localhost:3000
   ```

## Upload online

Use a Node.js host such as Render, Railway, Fly.io, or a VPS.

Set these environment variables in your host dashboard:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.2
```

Use this start command:

```bash
npm start
```

Do not upload a real `.env` file or put the API key in `index.html`, `script.js`, or any frontend file.
