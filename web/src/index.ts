import * as socket from "socket.io-client";

const io = socket.connect("http://localhost:4040");

const KEY = "1";

io.emit("joinRoom", KEY);

console.log("Live");

io.on(
  "message",
  (message: { date: Date; text: string; key: string; image?: string }) =>
    console.log(message)
);

const btn = document.querySelector("button");

btn?.addEventListener("click", () => {
  console.log("added");
  io.emit("message", {
    text: "Test",
    date: new Date(),
    key: KEY,
  });
});
