import os
import json
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
import torch
from pathlib import Path

# Setup Device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# Load BLIP Model for Auto-Captioning
print("Loading BLIP captioning model...")
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large").to(device)

dataset_dir = Path("../dataset").resolve()
metadata_file = dataset_dir / "metadata.jsonl"
processed_dir = dataset_dir / "processed"
os.makedirs(processed_dir, exist_ok=True)

# Suffix to ensure the model associates these images with a realistic imagination style
STYLE_SUFFIX = " masterpiece, highly detailed, ultra realistic, 8k resolution."

print(f"Scanning dataset folder: {dataset_dir}")
image_files = [f for f in os.listdir(dataset_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]

if not image_files:
    print("No images found in the dataset directory.")
    exit()

print(f"Found {len(image_files)} images. Starting captioning and processing...")

metadata_entries = []

for filename in image_files:
    img_path = dataset_dir / filename
    try:
        raw_image = Image.open(img_path).convert("RGB")
        
        # Resize to standard 512x512 for SD1.5 fine-tuning
        img_resized = raw_image.resize((512, 512), Image.Resampling.LANCZOS)
        out_filename = f"processed_{filename}"
        out_path = processed_dir / out_filename
        img_resized.save(out_path)
        
        # Generate Caption
        inputs = processor(raw_image, return_tensors="pt").to(device)
        out = model.generate(**inputs, max_new_tokens=50)
        caption = processor.decode(out[0], skip_special_tokens=True)
        
        # Enhance caption with our realistic prompt style
        enhanced_caption = f"{caption},{STYLE_SUFFIX}"
        
        # Add to metadata relative to the processed directory
        metadata_entries.append({"file_name": out_filename, "text": enhanced_caption})
        print(f"Processed {filename} -> {enhanced_caption}")
        
    except Exception as e:
        print(f"Error processing {filename}: {e}")

# Save JSONL inside the processed directory for the HuggingFace dataset format
with open(processed_dir / "metadata.jsonl", "w", encoding="utf-8") as f:
    for entry in metadata_entries:
        f.write(json.dumps(entry) + "\n")

print(f"\nDone! Processed {len(metadata_entries)} images.")
print(f"Images and metadata saved to: {processed_dir}")
