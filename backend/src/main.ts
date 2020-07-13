import { createAppFactory } from "./app";

export async function bootstrap() {
  const port = 3000;
  const app = createAppFactory();
  await app.startListening(port);
  console.log(`App is listening on port ${port}`);
}

bootstrap();
