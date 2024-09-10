import Fastify from "fastify";
import * as dotenv from "dotenv";
import fontRoutes from "./font";

dotenv.config();

const app = Fastify({
  logger: true,
});

app.register(fontRoutes, {
  prefix: "/api/font",
});

let isReady = false;

const handler = async (req: any, res: any) => {
  if (!isReady) {
    await app.ready();
    isReady = true;
  }

  app.server.emit("request", req, res);
};

export default handler;
