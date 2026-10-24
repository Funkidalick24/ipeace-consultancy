import 'dotenv/config';
import { env } from './config/env';
import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDB } from "./database";

const app = express();

const isDev = app.get("env") === "development";

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Vite's dev server injects inline scripts for HMR; production builds don't need it
      scriptSrc: isDev ? ["'self'", "'unsafe-inline'"] : ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", env.FRONTEND_URL],
      frameSrc: ['https://www.youtube.com'],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req: any, res: any, next: any) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  }, 30000);

  res.on('finish', () => {
    clearTimeout(timeout);
  });

  next();
});

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      const logLine = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;
      if (res.statusCode >= 400) {
        console.error(logLine);
      } else {
        log(logLine);
      }
    }
  });

  next();
});

(async () => {
  await connectDB();

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    if (status === 500) {
      console.error(err);
    }
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  let port = env.PORT;
  
  function startServer(attempts = 0) {
    if (attempts > 10) {
      log(`Failed to start server after 10 attempts`);
      process.exit(1);
    }
    
    if (server.listening) {
      server.close(() => {
        log(`Closed server on port ${port}`);
      });
    }
    
    server.listen(port, () => {
      log(`serving on port ${port}`);
    });
    
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        log(`Port ${port} is already in use, trying ${port + 1}`);
        port++;
        server.close(() => {
          startServer(attempts + 1);
        });
      } else {
        log(`Server error: ${error.message}`);
      }
    });
  }
  
  startServer();
})();