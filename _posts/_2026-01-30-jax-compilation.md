---
title: 'Jax Compilation'
excerpt: "What is it being compiled to? What's tracing? Why does my code not work? [Read more](/posts/2026/01/spike-info/)<br/><img src='/assets/images/spike_info.png'>"
date: 2026-01-30
permalink: /posts/2025/01/spike-info/
tags:
  - JAX
  - compile
  - JIT
  - tracing
  - XLA
---

If you ever used JAX then you know that it never works. There's some tracing problem or things can't JIT or something. Today we will figure out what the heck is going on.

## JAX Compilation Pipeline

<style>
.compilation-pipeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 2em auto;
  max-width: 800px;
}

.compilation-stage {
  border-radius: 8px;
  padding: 0;
  margin: 0;
}

.compilation-stage summary {
  cursor: pointer;
  font-weight: bold;
  padding: 15px;
  user-select: none;
  border-radius: 6px;
}

.compilation-stage[open] summary {
  border-radius: 6px 6px 0 0;
}

.compilation-stage pre {
  margin: 15px;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.compilation-stage code {
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

/* Python stage - Blue */
.stage-python {
  background-color: #e3f2fd;
  border: 2px solid #4a90e2;
}

.stage-python summary {
  color: #1565c0;
  background-color: #bbdefb;
}

.stage-python summary:hover {
  background-color: #90caf9;
}

.stage-python[open] summary {
  border-bottom: 2px solid #4a90e2;
}

.stage-python pre {
  background-color: #1e3a5f;
}

.stage-python code {
  color: #e3f2fd;
}

/* XLA stage - Orange */
.stage-xla {
  background-color: #fff3e0;
  border: 2px solid #f39c12;
}

.stage-xla summary {
  color: #e65100;
  background-color: #ffe0b2;
}

.stage-xla summary:hover {
  background-color: #ffcc80;
}

.stage-xla[open] summary {
  border-bottom: 2px solid #f39c12;
}

.stage-xla pre {
  background-color: #5e3a1a;
}

.stage-xla code {
  color: #fff3e0;
}

/* Machine code stage - Purple */
.stage-machine {
  background-color: #f3e5f5;
  border: 2px solid #9b59b6;
}

.stage-machine summary {
  color: #6a1b9a;
  background-color: #e1bee7;
}

.stage-machine summary:hover {
  background-color: #ce93d8;
}

.stage-machine[open] summary {
  border-bottom: 2px solid #9b59b6;
}

.stage-machine pre {
  background-color: #3d2654;
}

.stage-machine code {
  color: #f3e5f5;
}

/* Arrows with matching colors */
.pipeline-arrow {
  text-align: center;
  font-size: 2em;
  margin: 10px 0;
  user-select: none;
}

.arrow-python {
  color: #4a90e2;
}

.arrow-xla {
  color: #f39c12;
}
</style>

<div class="compilation-pipeline">
  <details class="compilation-stage stage-python" open>
    <summary>Python Code</summary>
    <pre><code>import jax.numpy as jnp
from jax import jit

@jit
def matrix_multiply(A, B):
    return jnp.dot(A, B)

# Example usage
A = jnp.ones((1000, 1000))
B = jnp.ones((1000, 1000))
result = matrix_multiply(A, B)</code></pre>
  </details>

  <div class="pipeline-arrow arrow-python">↓</div>

  <details class="compilation-stage stage-xla">
    <summary>XLA (Accelerated Linear Algebra)</summary>
    <pre><code>HloModule jit_matrix_multiply

ENTRY main {
  arg0 = f32[1000,1000] parameter(0)
  arg1 = f32[1000,1000] parameter(1)
  ROOT dot = f32[1000,1000] dot(arg0, arg1),
    lhs_contracting_dims={1},
    rhs_contracting_dims={0}
}</code></pre>
  </details>

  <div class="pipeline-arrow arrow-xla">↓</div>

  <details class="compilation-stage stage-machine">
    <summary>Machine Code (x86/CUDA/TPU)</summary>
    <pre><code>; Example x86-64 assembly (simplified)
vmovaps  ymm0, ymmword ptr [rdi]
vmovaps  ymm1, ymmword ptr [rsi]
vfmadd231ps ymm2, ymm0, ymm1
vmovaps  ymmword ptr [rdx], ymm2

; Or CUDA PTX for GPU
ld.global.f32  %f1, [%rd1]
ld.global.f32  %f2, [%rd2]
fma.f32        %f3, %f1, %f2, %f3
st.global.f32  [%rd3], %f3</code></pre>
  </details>
</div>

