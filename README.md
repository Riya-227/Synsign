# SynSign — Indian Sign Language Recognition & Translation API

> Real-time ISL gesture recognition, speech processing, and translation
> powered by MediaPipe, PyTorch, and FastAPI.

## 🏗️ Architecture

```
app/
├── main.py                    # FastAPI entrypoint
├── core/                      # Security, config, singletons
├── services/
│   ├── auth/                  # JWT authentication
│   ├── gesture/               # MediaPipe + PyTorch gesture recognition
│   ├── speech/                # TTS (gTTS) & STT engine
│   ├── translation/           # English → ISL gloss → animation mapping
│   ├── dictionary/            # ISL sign lookup & search
│   └── pipeline/              # Real-time WebSocket streaming
├── models/                    # PyTorch / ONNX weight files
└── schemas/                   # Pydantic request/response schemas
```

Each service is **fully decoupled** — AI model changes don't break REST APIs,
and transport logic stays separate from data processing.

## 🚀 Quick Start

```bash
# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📡 API Endpoints

| Prefix                    | Description                          |
|---------------------------|--------------------------------------|
| `POST /api/v1/auth/*`    | Register, login, profile             |
| `POST /api/v1/gesture/*` | Upload image → gesture prediction    |
| `POST /api/v1/speech/*`  | Text-to-speech & speech-to-text      |
| `POST /api/v1/translation/*` | Text → ISL gloss → animations   |
| `GET  /api/v1/dictionary/*`  | ISL sign search & lookup         |
| `WS   /api/v1/pipeline/ws/recognize` | Real-time streaming      |
| `GET  /health`            | Service health check                 |

Interactive docs available at **http://localhost:8000/docs**

## 🧪 Testing

```bash
pip install pytest httpx
pytest tests/ -v
```

## 🤖 Agent Skills

Custom agent skills in `.agents/skills/` ensure AI coding assistants
follow SynSign conventions:

- **model-validator** — Validates PyTorch/ONNX model contracts
- **fastapi-router** — Enforces router patterns and naming conventions

## 📄 License

MIT
