"""
HLD Academy — a tiny Flask app to author and read High-Level Design problems.

Run:
    pip install -r requirements.txt
    python main.py

Then open http://127.0.0.1:5000
"""
from __future__ import annotations

import base64
import json
import re
import uuid
from datetime import datetime
from pathlib import Path

from flask import Flask, abort, jsonify, render_template, request

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_EXTS = {"png", "jpg", "jpeg", "gif", "webp", "svg"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES


# ---------- storage helpers (flat JSON files, one per problem) ----------

def _slugify(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text or "").strip().lower()
    text = re.sub(r"[\s_-]+", "-", text)
    return text or uuid.uuid4().hex[:8]


def list_problems() -> list[dict]:
    items = []
    for p in DATA_DIR.glob("*.json"):
        try:
            with p.open() as f:
                data = json.load(f)
            items.append({
                "id": data.get("id", p.stem),
                "title": data.get("title", "Untitled"),
                "tags": data.get("tags", []),
                "updated_at": data.get("updated_at", ""),
                "summary": data.get("summary", ""),
            })
        except Exception:
            continue
    items.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    return items


def load_problem(pid: str) -> dict | None:
    path = DATA_DIR / f"{pid}.json"
    if not path.exists():
        return None
    with path.open() as f:
        return json.load(f)


def save_problem(data: dict) -> dict:
    pid = data.get("id") or _slugify(data.get("title", "")) or uuid.uuid4().hex[:8]
    base = pid
    i = 2
    while not data.get("id") and (DATA_DIR / f"{pid}.json").exists():
        pid = f"{base}-{i}"
        i += 1
    data["id"] = pid
    data["updated_at"] = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    if "created_at" not in data:
        data["created_at"] = data["updated_at"]
    with (DATA_DIR / f"{pid}.json").open("w") as f:
        json.dump(data, f, indent=2)
    return data


def delete_problem(pid: str) -> bool:
    path = DATA_DIR / f"{pid}.json"
    if path.exists():
        path.unlink()
        return True
    return False


# ---------- page routes ----------

@app.route("/")
def index():
    return render_template("index.html", problems=list_problems())


@app.route("/problem/<pid>")
def view_problem(pid: str):
    data = load_problem(pid)
    if not data:
        abort(404)
    return render_template("view.html", problem=data)


@app.route("/new")
def new_problem():
    return render_template("edit.html", problem=None)


@app.route("/edit/<pid>")
def edit_problem(pid: str):
    data = load_problem(pid)
    if not data:
        abort(404)
    return render_template("edit.html", problem=data)


@app.route("/markdown-guide")
def markdown_guide():
    return render_template("markdown_guide.html")


# ---------- JSON API ----------

@app.post("/api/problems")
def api_create():
    payload = request.get_json(force=True)
    payload.pop("id", None)
    saved = save_problem(payload)
    return jsonify(saved), 201


@app.put("/api/problems/<pid>")
def api_update(pid: str):
    existing = load_problem(pid)
    if not existing:
        abort(404)
    payload = request.get_json(force=True)
    payload["id"] = pid
    payload["created_at"] = existing.get("created_at")
    saved = save_problem(payload)
    return jsonify(saved)


@app.delete("/api/problems/<pid>")
def api_delete(pid: str):
    if not delete_problem(pid):
        abort(404)
    return ("", 204)


# ---------- image uploads (paste / drop / pick) ----------

def _save_image_bytes(raw: bytes, ext: str) -> dict:
    ext = ext.lower().lstrip(".")
    if ext == "jpeg":
        ext = "jpg"
    if ext not in ALLOWED_IMAGE_EXTS:
        return {"error": f"Unsupported image type: {ext}"}, 400
    if len(raw) > MAX_UPLOAD_BYTES:
        return {"error": "File too large (max 10MB)"}, 413
    name = f"{uuid.uuid4().hex}.{ext}"
    (UPLOAD_DIR / name).write_bytes(raw)
    return {"url": f"/static/uploads/{name}", "filename": name}, 201


@app.post("/api/uploads")
def api_upload():
    """Accept either multipart 'file' or JSON { "data": "data:image/...;base64,..." }."""
    if "file" in request.files:
        f = request.files["file"]
        ext = (f.filename.rsplit(".", 1)[-1] or "").lower() if f.filename else ""
        body, status = _save_image_bytes(f.read(), ext)
        return jsonify(body), status

    payload = request.get_json(force=True, silent=True) or {}
    data_url = payload.get("data", "")
    m = re.match(r"^data:image/([\w+\-.]+);base64,(.+)$", data_url, re.DOTALL)
    if not m:
        return jsonify({"error": "Invalid data URL"}), 400

    ext = m.group(1)
    try:
        raw = base64.b64decode(m.group(2))
    except Exception:
        return jsonify({"error": "Invalid base64 data"}), 400

    body, status = _save_image_bytes(raw, ext)
    return jsonify(body), status


# ---------- bootstrap a sample problem on first run ----------

def seed_sample():
    sample_path = DATA_DIR / "camelcamelcamel.json"
    if sample_path.exists():
        return
    from sample_data import SAMPLE_PROBLEM
    save_problem(SAMPLE_PROBLEM)


if __name__ == "__main__":
    seed_sample()
    app.run(debug=True)