import { wc } from "./utils.js";

const input = document.getElementById("input");
const status_msg = document.getElementById("status");
status_msg.textContent = "Status: connecting";

const ws_message = new WebSocket(ws_message_endpoint);
const ws_heartbeat = new WebSocket(ws_heartbeat_endpoint);

function updateClientMessage(event) {
  count = parseInt(event.data);
  let conn_count_text = count > 1 ? `${count} clients` : `${count} client`;
  let room = document.URL.split("/").pop();
  document.getElementById("client-count").textContent = conn_count_text;
  document.getElementById("room-name").textContent = room;
}

function updateWordCountMessage() {
  const wcResult = wc(input.value);
  document.getElementById("word-count").textContent = `${wcResult.lines} line${
    wcResult.lines > 1 ? "s" : ""
  }, \
         ${wcResult.words} word${wcResult.words > 1 ? "s" : ""}, \
         ${wcResult.chars} char${wcResult.chars > 1 ? "s" : ""}`;
}

ws_message.onmessage = (event) => {
  input.value = event.data;
  updateWordCountMessage(input.value);
};

ws_heartbeat.onopen = () => {
  ws_heartbeat.send("");
};
ws_heartbeat.onmessage = (event) => {
  updateClientMessage(event);

  status_msg.textContent = "Status: connected";
  const timer = setTimeout(() => {
    status_msg.textContent = "Status: timed out";
  }, 5000);

  setTimeout(() => {
    ws_heartbeat.send("");
    clearTimeout(timer);
  }, 1000);
};
ws_heartbeat.onclose = () => {
  status_msg.textContent = "Status: disconnected";
};

input.addEventListener("input", () => {
  ws_message.send(input.value);
});

updateWordCountMessage(input.value);
