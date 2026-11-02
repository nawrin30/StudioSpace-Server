
import "dotenv/config";
import app from "./server";
import { connectDB } from "./config/db";

const port = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`StudioSpace API is running at http://localhost:${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Could not start StudioSpace API:", error);
    process.exit(1);
  });
