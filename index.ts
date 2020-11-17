import socket from "socket.io";
import express from "express";
import http from "http";
import redis from "redis";
import secret from "./secret";
import { promisify } from "util";

const app = express();

const PORT = process.env.PORT || 4040;

const server = http.createServer(app);

server.listen(PORT, () => console.log(PORT));

const io = socket(server);

const client = redis.createClient(secret);

const redisGetAsync = promisify(client.get).bind(client);

//{ host: '', port: 1233, password: ''}

io.on("connect", (ioSocket) => {
  ioSocket.on("joinRoom", async (key: string) => {
    ioSocket.join(key);

    const messageData = await redisGetAsync(key);

    // need to make sure that we are grabbing this history data on the frontend
    ioSocket.emit("history", messageData);
  });

  ioSocket.on("message", (message: Message) => {
    // save message
    saveMessage(message);
    // to everybody in the room including myself
    ioSocket.nsp.to(message.key).emit("message", message);
  });
});

const saveMessage = async (message: Message) => {
  const { key } = message;

  const data = await redisGetAsync(key);

  // the first message in the chat room
  if (!data) {
    return client.set(key, "[]");
  }

  const json = JSON.parse(data);
  json.push(message);

  client.set(key, JSON.stringify(json));
};

type Message = {
  text: string;
  date: Date;
  key: string;
  image?: string;
};
