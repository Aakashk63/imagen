import torch
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from compel import Compel
import os
import uuid
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("outputs", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Use DreamShaper 8 as our base "Imagen" model for superior quality and consistency
model_id = "Lykon/dreamshaper-8"
device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if device == "cuda" else torch.float32

print(f"Loading '{model_id}' on {device}...")

# Disable the safety checker to prevent false positives that return black images
pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=dtype, safety_checker=None)

# Speed UP: Use DPM++ 2M Karras scheduler which only needs 20 steps to look amazing instead of 50
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, algorithm_type="dpmsolver++", use_karras_sigmas=True)

# Memory and speed optimizations for cards like RTX 2050
if device == "cuda":
    # Drastically reduce VRAM usage to fit strictly within 4GB so it doesn't crash to System RAM (which causes 10min generations)
    pipe.enable_model_cpu_offload()
    try:
        pipe.enable_xformers_memory_efficient_attention()
        print("xformers enabled for faster generation!")
    except Exception as e:
        print("xformers not available, using standard attention.")
    
    pipe.enable_attention_slicing()
    pipe.vae.to(torch.float32)
else:
    pipe.to(device)

lora_path = "sd-model-finetuned-lora"
if os.path.exists(lora_path):
    try:
        print(f"Applying custom trained LoRA weights from {lora_path}...")
        pipe.load_lora_weights(lora_path)
    except Exception as e:
        print(f"Failed to load LoRA: {e}")

# COMPEL SETUP: This allows us to use parenthesis weighting like "(red blazer)++"
compel_proc = Compel(tokenizer=pipe.tokenizer, text_encoder=pipe.text_encoder)

print("Model & Compel processor loaded successfully!")

class PromptReq(BaseModel):
    prompt: str
    negative_prompt: str = ""

def process_generation_request(prompt: str, negative_prompt: str, request: Request):
    print(f"Translating prompt for better accuracy: '{prompt}'")
    
    # Generate weighted embeddings using Compel
    prompt_embeds = compel_proc(prompt)
    negative_embeds = compel_proc(negative_prompt) if negative_prompt else None
    
    # Explicitly use a random generator so every output is completely unique
    import random
    seed = random.randint(0, 2147483647)
    print(f"Using random seed: {seed}")
    generator = torch.Generator(device=device).manual_seed(seed)
    
    # Pass the embedded prompt instead of the raw string!
    # DPMSolver gets amazing results in just 20 steps, reducing time even more!
    image = pipe(
        prompt_embeds=prompt_embeds,
        negative_prompt_embeds=negative_embeds, 
        num_inference_steps=20,
        guidance_scale=7.5,
        generator=generator
    ).images[0]
    
    # Save image to disk
    filename = f"{uuid.uuid4()}.png"
    filepath = os.path.join("outputs", filename)
    image.save(filepath, format="PNG")
    
    # Generate a public URL based on the network request dynamically!
    base_url = str(request.base_url)
    if not base_url.endswith("/"):
        base_url += "/"
    image_url = f"{base_url}outputs/{filename}"
    
    print(f"Image generation complete: {image_url}")
    return {"image": image_url}

@app.post("/generate")
def generate_post(req: PromptReq, request: Request):
    return process_generation_request(req.prompt, req.negative_prompt, request)

@app.get("/generate")
def generate_get(prompt: str, request: Request, negative_prompt: str = ""):
    return process_generation_request(prompt, negative_prompt, request)

@app.get("/history")
def get_history(request: Request):
    base_url = str(request.base_url)
    if not base_url.endswith("/"):
        base_url += "/"
        
    outputs_dir = "outputs"
    if not os.path.exists(outputs_dir):
        return {"history": []}
        
    # Get all .png files and sort by modification time (newest first)
    files = [f for f in os.listdir(outputs_dir) if f.endswith(".png")]
    files.sort(key=lambda x: os.path.getmtime(os.path.join(outputs_dir, x)), reverse=True)
    
    # Generate URLs for the files
    history_urls = [f"{base_url}outputs/{f}" for f in files]
    
    return {"history": history_urls}

if __name__ == "__main__":
    import uvicorn
    # 0.0.0.0 binds to all network interfaces allowing external devices to connect
    uvicorn.run(app, host="0.0.0.0", port=8000)

