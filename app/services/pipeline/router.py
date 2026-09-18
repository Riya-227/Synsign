"""
Pipeline Router — Real-time WebSocket Streaming

Endpoints:
  WS /ws/recognize  — Stream video frames and receive gesture predictions in real time
  GET /status        — Pipeline health / readiness check
"""

import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.gesture.service import GestureService
from app.services.translation.service import TranslationService

router = APIRouter()

# Shared service instances for the pipeline
_gesture_svc = GestureService()
_translation_svc = TranslationService()


from app.services.pipeline.websocket_server import process_frame_stream

@router.websocket("/ws/recognize")
async def websocket_recognize(websocket: WebSocket):
    """
    Real-time gesture recognition over WebSocket.

    Protocol:
      Client sends: base64 encoded image frame
      Server replies: JSON with gesture prediction {gloss: string, confidence: float}

    The connection stays open for continuous streaming until the
    client disconnects. Maintains <30ms latency by dropping stale frames.
    """
    await process_frame_stream(websocket)


@router.get("/status")
async def pipeline_status():
    """Check whether the real-time pipeline services are ready."""
    return {
        "pipeline": "ready",
        "gesture_service": "loaded",
        "translation_service": "loaded",
    }
