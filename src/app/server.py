"""ADAPT learner product HTTP server.

Serves the static frontend and a thin JSON API over ProductService.
No adaptive decisions are computed here.
"""

from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

from adapt.product.errors import ProductError
from adapt.product.service import ProductService

STATIC_DIR = Path(__file__).resolve().parent / "static"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8765

CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
}


def _json_bytes(payload: Any, *, status: int = 200) -> tuple[int, bytes, str]:
    body = json.dumps(payload, indent=2).encode("utf-8")
    return status, body, "application/json; charset=utf-8"


class AdaptHandler(BaseHTTPRequestHandler):
    server_version = "ADAPT/4"

    def log_message(self, format: str, *args: Any) -> None:
        return

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/"):
            self._handle_api("GET", path, None, parse_qs(parsed.query))
            return
        self._serve_static(path)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b""
        payload: Any = {}
        if raw:
            try:
                payload = json.loads(raw.decode("utf-8"))
            except json.JSONDecodeError:
                self._write(*_json_bytes({"error": "invalid_response", "message": "JSON body is invalid"}, status=400))
                return
        self._handle_api("POST", parsed.path, payload, parse_qs(parsed.query))

    def _handle_api(self, method: str, path: str, payload: Any, query: dict[str, list[str]]) -> None:
        service: ProductService = self.server.product  # type: ignore[attr-defined]
        try:
            status, body = self._route(service, method, path, payload or {}, query)
        except ProductError as exc:
            status, body, _ctype = _json_bytes(
                {"error": exc.code, "message": str(exc)},
                status=exc.http_status,
            )
            self._write(status, body, "application/json; charset=utf-8")
            return
        except Exception as exc:  # pragma: no cover - last-resort guard
            status, body, _ctype = _json_bytes(
                {"error": "submission_error", "message": str(exc)},
                status=500,
            )
            self._write(status, body, "application/json; charset=utf-8")
            return
        self._write(status, body, "application/json; charset=utf-8")

    def _route(
        self,
        service: ProductService,
        method: str,
        path: str,
        payload: dict[str, Any],
        query: dict[str, list[str]],
    ) -> tuple[int, bytes]:
        if method == "GET" and path == "/api/health":
            return _json_bytes({"ok": True, "service": "adapt-phase4"})[:2]
        if method == "GET" and path == "/api/topics":
            return _json_bytes({"topics": service.list_topics()})[:2]
        if method == "POST" and path == "/api/sessions":
            view = service.create_session(
                topic_id=str(payload.get("topic_id") or ""),
                learner_id=payload.get("learner_id"),
                max_steps=int(payload.get("max_steps") or 10),
                mode=str(payload.get("mode") or "learner"),
                session_id=payload.get("session_id"),
                initial_challenge=payload.get("initial_challenge"),
            )
            return _json_bytes(view, status=201)[:2]
        if method == "POST" and path == "/api/sessions/restore":
            return _json_bytes(service.restore(payload))[:2]
        if method == "POST" and path == "/api/demo":
            return _json_bytes(service.start_demo(scenario=payload.get("scenario")), status=201)[:2]
        if method == "POST" and path == "/api/demo/counterfactual":
            return _json_bytes(service.run_counterfactual(payload or None))[:2]
        parts = [item for item in path.split("/") if item]
        if len(parts) >= 3 and parts[0] == "api" and parts[1] == "sessions":
            session_id = parts[2]
            rest = parts[3:] if len(parts) > 3 else []
            if method == "GET" and rest == []:
                return _json_bytes(service.get_session(session_id))[:2]
            if method == "POST" and rest == ["responses"]:
                return _json_bytes(
                    service.submit_response(
                        session_id,
                        answer=payload.get("answer"),
                        confidence=payload.get("confidence"),
                        reasoning=payload.get("reasoning"),
                        challenge_id=payload.get("challenge_id"),
                    )
                )[:2]
            if method == "GET" and rest == ["trace"]:
                return _json_bytes(service.get_trace(session_id))[:2]
            if method == "GET" and rest == ["summary"]:
                return _json_bytes(service.get_summary(session_id))[:2]
            if method == "GET" and rest == ["story"]:
                return _json_bytes(service.get_story(session_id))[:2]
            if method == "POST" and rest == ["snapshot"]:
                return _json_bytes(service.snapshot(session_id))[:2]
        if method == "POST" and len(parts) == 4 and parts[:2] == ["api", "demo"] and parts[3] == "step":
            return _json_bytes(service.demo_step(parts[2]))[:2]
        _ = query
        status, body, _ctype = _json_bytes(
            {"error": "session_unavailable", "message": "Unknown API route"},
            status=404,
        )
        return status, body

    def _serve_static(self, path: str) -> None:
        relative = "index.html" if path in {"", "/"} else path.lstrip("/")
        target = (STATIC_DIR / relative).resolve()
        if STATIC_DIR not in target.parents and target != STATIC_DIR:
            self._write(404, b"Not found", "text/plain; charset=utf-8")
            return
        if not target.exists() or not target.is_file():
            fallback = STATIC_DIR / "index.html"
            if fallback.exists() and not relative.startswith("api/"):
                data = fallback.read_bytes()
                self._write(200, data, CONTENT_TYPES[".html"])
                return
            self._write(404, b"Not found", "text/plain; charset=utf-8")
            return
        data = target.read_bytes()
        ctype = CONTENT_TYPES.get(target.suffix, "application/octet-stream")
        self._write(200, data, ctype)

    def _write(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")


class ProductServer(ThreadingHTTPServer):
    def __init__(self, host: str, port: int, service: ProductService | None = None) -> None:
        super().__init__((host, port), AdaptHandler)
        self.product = service or ProductService()
        self.host = host
        self.port = port


def create_server(
    *,
    host: str = DEFAULT_HOST,
    port: int = DEFAULT_PORT,
    service: ProductService | None = None,
) -> ProductServer:
    return ProductServer(host, port, service)


def serve(host: str = DEFAULT_HOST, port: int = DEFAULT_PORT) -> None:
    server = create_server(host=host, port=port)
    print(f"ADAPT is running at http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()
