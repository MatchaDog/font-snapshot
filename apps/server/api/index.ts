"use strict";
import { type FastifyInstance, type FastifyServerOptions } from "fastify";

// Read the .env file.
import * as dotenv from "dotenv";
dotenv.config();

// Require the framework
import Fastify from "fastify";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
app.register(import("../index"), {
  prefix: "/",
});

export default async (req: FastifyInstance, res: FastifyServerOptions) => {
  await app.ready();
  app.server.emit("request", req, res);
};
