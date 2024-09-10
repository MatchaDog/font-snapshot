import Fastify from "fastify";
import * as dotenv from "dotenv";
import fontRoutes from "./font";
dotenv.config();

const app = Fastify({
  logger: true,
});

app.register(fontRoutes, {
  prefix: "/api",
});

const handler = async (req: any, res: any) => {
  await app.ready();
  app.server.emit("request", req, res);
};

export default handler;
