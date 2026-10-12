---
name: vLLM
status: Watch
link: https://vllm.ai
why: PagedAttention, tensor parallelism, production-proven
---

Self-hosting LLMs without vLLM is like driving without wheels. PagedAttention (inspired by OS virtual memory) manages KV cache so efficiently that vLLM delivers up to 24x higher throughput than HuggingFace Transformers. Existing systems waste 60-80% of memory on fragmentation; vLLM reduces waste to near zero. Joined the PyTorch ecosystem in December 2024. Supports quantization, speculative decoding, tensor parallelism across GPUs, and all the models you care about (Llama, Mistral, DeepSeek). If you're running inference at scale, vLLM is the de facto standard.
