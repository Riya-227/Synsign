import asyncio
import websockets
import json
import time

async def test_pipeline():
    uri = "ws://localhost:8000/api/v1/pipeline/ws/recognize"
    async with websockets.connect(uri) as websocket:
        print("Connected to SynSign WebSocket! Stress testing 100 frames...")
        
        test_b64_img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
        payload = json.dumps({"frame": f"data:image/png;base64,{test_b64_img}"})
        
        latencies = []
        for _ in range(100):
            start = time.perf_counter()
            await websocket.send(payload)
            response = await websocket.recv()
            end = time.perf_counter()
            latencies.append((end - start) * 1000) # ms
            
        avg_latency = sum(latencies) / len(latencies)
        max_latency = max(latencies)
        print(f"Tested 100 frames.")
        print(f"Average Latency: {avg_latency:.2f} ms")
        print(f"Max Latency: {max_latency:.2f} ms")

if __name__ == "__main__":
    asyncio.run(test_pipeline())
