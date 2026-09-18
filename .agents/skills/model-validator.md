---
name: model-validator
description: Rules for testing and validating PyTorch model integration in SynSign
---
# Model Validation Protocol
When updating or building ML models in `app/models/` or `app/services/gesture/`:
1. Always test model loading speed and memory footprint.
2. Ensure frame inference execution time remains under 20ms on CPU.
3. Validate tensor dimensions explicitly prior to running forward passes.
4. Verify that missing landmarks (e.g., hand out of frame) return empty predictions gracefully without throwing exceptions.
