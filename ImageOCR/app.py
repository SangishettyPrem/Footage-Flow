from flask import Flask, request, jsonify
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image  # ✅ MISSING IMPORT
import io

app = Flask(__name__)

processor = None
caption_model = None

def load_caption_model():
    global processor, caption_model
    if processor is None or caption_model is None:
        print("Loading image captioning model...")
        processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        print("Captioning model loaded.")

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok", "message": "Server is running"}), 200

@app.route("/caption", methods=["POST"])
def caption():
    load_caption_model()
    if 'image' not in request.files:
        return jsonify({"error": "No image file"}), 400

    image = request.files['image']
    img = Image.open(io.BytesIO(image.read())).convert("RGB")

    inputs = processor(images=img, return_tensors="pt")
    out = caption_model.generate(**inputs)
    cap = processor.decode(out[0], skip_special_tokens=True)

    return jsonify({"caption": cap})

if __name__ == "__main__":
    load_caption_model()
    app.run(port=3000, debug=True)
