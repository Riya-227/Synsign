"""
WebSocket Streaming Pipeline Server

Low-latency real-time video streaming server handling:
  - Base64 encoded frame reception
  - Dropping stale frames to maintain <30ms latency (Queue maxsize=2)
  - OpenCV in-memory decoding
  - Gesture recognition and gloss translation integration
"""

import asyncio
import base64
import json
import logging
from fastapi import WebSocket, WebSocketDisconnect

from app.services.gesture.service import GestureService

logger = logging.getLogger(__name__)

# Shared service instances
gesture_svc = GestureService()

async def process_frame_stream(websocket: WebSocket):
    """
    Handles a single WebSocket client connection.
    Implements a bounded queue to drop stale frames and preserve low latency.
    """
    await websocket.accept()
    
    # Bounded queue to keep latency under 30ms. 
    # If the consumer falls behind, oldest frames are dropped.
    frame_queue = asyncio.Queue(maxsize=2)
    
    async def receiver():
        try:
            while True:
                # Receive base64 encoded text frame
                text_data = await websocket.receive_text()
                
                # If queue is full, drop the oldest frame to prevent backlog latency
                if frame_queue.full():
                    try:
                        frame_queue.get_nowait()
                        frame_queue.task_done()
                        logger.debug("Dropped stale frame to maintain low latency.")
                    except asyncio.QueueEmpty:
                        pass
                
                await frame_queue.put(text_data)
        except WebSocketDisconnect:
            pass
        except Exception as e:
            logger.error(f"Receiver error: {e}")
            
    async def processor():
        try:
            while True:
                text_data = await frame_queue.get()
                
                try:
                    # Support both raw base64 strings and JSON objects ({"frame": "..."})
                    if text_data.strip().startswith("{"):
                        try:
                            json_data = json.loads(text_data)
                            text_data = json_data.get("frame", text_data)
                        except json.JSONDecodeError:
                            pass
                            
                    # Strip data URL scheme if present (e.g., "data:image/jpeg;base64,...")
                    if "," in text_data:
                        text_data = text_data.split(",")[1]
                        
                    # Decode base64 to raw image bytes for OpenCV decoding
                    image_bytes = base64.b64decode(text_data)
                    
                    # Pass through Gesture Recognition service
                    prediction = gesture_svc.predict(image_bytes)
                    
                    if prediction:
                        # Return JSON with gloss and confidence as requested
                        await websocket.send_json({
                            "gloss": prediction["gesture"],
                            "confidence": prediction["confidence"]
                        })
                except Exception as e:
                    logger.debug(f"Frame processing error: {e}")
                finally:
                    frame_queue.task_done()
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Processor error: {e}")

    # Run receiver and processor concurrently
    receiver_task = asyncio.create_task(receiver())
    processor_task = asyncio.create_task(processor())
    
    # Wait for either task to finish (e.g., receiver exits on disconnect)
    done, pending = await asyncio.wait(
        [receiver_task, processor_task], 
        return_when=asyncio.FIRST_COMPLETED
    )
    
    # Cleanup pending tasks
    for task in pending:
        task.cancel()
