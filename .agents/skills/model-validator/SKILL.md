---
name: model-validator
description: >
  Validates PyTorch and ONNX model files used in the SynSign gesture recognition
  pipeline. Ensures models conform to expected input/output shapes, data types,
  and inference performance constraints before deployment.
---

# Model Validator Skill

## Purpose
Ensure that any AI model added to `app/models/` meets the SynSign pipeline
contract before it is loaded in production.

## Validation Checklist

### 1. Input Shape
- The gesture classifier expects input tensors of shape `(batch, 63)` — 
  21 hand landmarks × 3 coordinates (x, y, z).
- Verify: `model.forward(torch.randn(1, 63))` should succeed without error.

### 2. Output Shape
- Output must be `(batch, num_classes)` where `num_classes` matches the
  label count in `GestureService.DEFAULT_LABELS` (currently 26 for A-Z).

### 3. Inference Latency
- Single-frame inference should complete in **< 50ms** on CPU to support
  real-time WebSocket streaming at ~20 FPS.

### 4. File Format
- Accepted formats: `.pth` (PyTorch state dict) or `.onnx` (ONNX runtime).
- Models must be loadable with `torch.load(path, map_location="cpu")`.

### 5. Weight Integrity
- After loading, run a forward pass with dummy data and confirm output is
  not all zeros / NaN.

## Example Validation Script

```python
import torch
from app.services.gesture.service import ISLGestureClassifier

model = ISLGestureClassifier(num_classes=26)
model.load_state_dict(torch.load("app/models/isl_gesture_model.pth", map_location="cpu"))
model.eval()

dummy = torch.randn(1, 63)
output = model(dummy)
assert output.shape == (1, 26), f"Unexpected output shape: {output.shape}"
assert not torch.isnan(output).any(), "Model produces NaN outputs"
print("✅ Model validation passed")
```

## When to Use
- After training a new model version.
- Before merging a PR that updates `app/models/`.
- When switching between `.pth` and `.onnx` formats.
