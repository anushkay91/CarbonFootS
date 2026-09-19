import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { CarbonCalculationEngine } from "./src/services/calculationEngine";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.use(express.json()); // Add JSON body parser

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Demo calculation route
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
