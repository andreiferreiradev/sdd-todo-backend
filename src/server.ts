import { buildApp } from "./app.js";
import { createSqliteDependencies } from "./config/dependencies.js";

const port = Number(process.env.PORT ?? 3000);

try {
  const { database, dependencies } = await createSqliteDependencies();
  const app = buildApp(dependencies);
  app.addHook("onClose", async () => {
    await database.destroy();
  });

  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`Server is running on port ${port}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
