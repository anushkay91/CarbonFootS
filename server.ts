import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { CarbonCalculationEngine } from "./src/services/calculationEngine";
import { GeminiCoachService } from "./src/services/GeminiCoachService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/calculate", (req, res) => {
    const { activityId, factorId, quantity, dataQuality } = req.body;
    try {
      const result = CarbonCalculationEngine.calculate(
        activityId,
        factorId,
        quantity,
        dataQuality
      );
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/coach", async (req, res) => {
    const { context, userPrompt } = req.body;
    if (!context) {
      return res.status(400).json({ error: "Missing context for coaching." });
    }
    try {
      const coaching = await GeminiCoachService.generateCoachingResponse(context, userPrompt);
      res.json(coaching);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Gemini coaching unavailable." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
