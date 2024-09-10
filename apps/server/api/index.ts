import Fastify from "fastify";
import * as dotenv from "dotenv";

dotenv.config();

const app = Fastify({
  logger: true,
});

app.register(import("../index"), {
  prefix: "/",
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
