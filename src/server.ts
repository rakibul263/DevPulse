import app from "./app";
import config from "./config";
import { initDatabase } from "./database/db";

async function main() {
  await initDatabase();
  
  if (process.env.NODE_ENV !== "production") {
    app.listen(config.port, () => {
      console.log(`server is running at port ${config.port}`);
    });
  }
}

main();

export default app;
