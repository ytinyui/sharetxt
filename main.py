import threading
from dataclasses import dataclass

from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.websockets import WebSocketDisconnect, WebSocketState


@dataclass
class Connection:
    text: str
    websockets: dict[int, WebSocket]


class WebSocketBroadcaster:
    def __init__(self):
        self.connections: dict[str, Connection] = {}
        self.lock = threading.Lock()

    def conn_count(self, path: str):
        return len(self.connections[path].websockets)

    async def broadcast(self, path: str, message: str):
        with self.lock:
            conn = self.connections[path]
            conn.text = message if message else ""
            for id_ in conn.websockets:
                websocket = conn.websockets[id_]
                if websocket.client_state == WebSocketState.CONNECTED:
                    await websocket.send_text(conn.text)

    async def register(self, path: str, websocket: WebSocket):
        with self.lock:
            if path not in self.connections:
                self.connections[path] = Connection("", {id(websocket): websocket})
            else:
                conn = self.connections[path]
                conn.websockets[id(websocket)] = websocket
                await websocket.send_text(conn.text)

    async def unregister(self, path: str, websocket: WebSocket):
        with self.lock:
            conn = self.connections[path]
            del conn.websockets[id(websocket)]
            if self.conn_count(path) == 0:
                conn.text = ""


app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(".")
ws_broadcaster = WebSocketBroadcaster()


@app.get("/")
async def index():
    return RedirectResponse("/default")


@app.get("/{path}")
async def get(request: Request, path: str = ""):
    return templates.TemplateResponse(
        request,
        "index.html",
        context={
            "ws_message": app.url_path_for("ws_message", path=path),
            "ws_heartbeat": app.url_path_for("ws_heartbeat", path=path),
        },
    )


@app.websocket("/ws/input/{path}")
async def ws_message(websocket: WebSocket, path: str):
    await websocket.accept()
    await ws_broadcaster.register(path, websocket)
    try:
        while True:
            text = await websocket.receive_text()
            await ws_broadcaster.broadcast(path, text)
    except WebSocketDisconnect:
        await ws_broadcaster.unregister(path, websocket)
        return


@app.websocket("/ws/heartbeat/{path}")
async def ws_heartbeat(websocket: WebSocket, path: str):
    await websocket.accept()
    try:
        while True:
            await websocket.receive_text()
            await websocket.send_text(str(ws_broadcaster.conn_count(path)))
    except WebSocketDisconnect:
        return
