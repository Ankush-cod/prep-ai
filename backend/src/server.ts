// src/server.ts
import app from './app';
import { prisma } from './config/database';
import { verifyMailTransporter } from './config/email';
import { env, serviceStatus } from './config/env';

async function startServer() {
  try {
    await prisma.$connect();
    console.log('[PrepAI] PostgreSQL connection established.');
  } catch (err) {
    console.warn(
      '[PrepAI] Could not verify PostgreSQL connection at startup:',
      err instanceof Error ? err.message : err
    );
  }

  const server = app.listen(env.port, () => {
    console.log(`[PrepAI Backend] Listening on http://localhost:${env.port}`);
    console.log(
      `[PrepAI Integrations] Gemini=${serviceStatus.hasGemini}, OpenAI=${serviceStatus.hasOpenAi}, OnlineCompiler=${serviceStatus.hasOnlineCompiler}, Cloudinary=${serviceStatus.hasCloudinary}, SMTP=${serviceStatus.hasSmtp}`
    );
    if (serviceStatus.hasSmtp) {
      void verifyMailTransporter();
    }
  });

  const shutdown = async () => {
    console.log('[PrepAI Backend] Shutting down gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
