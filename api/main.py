from fastapi import FastAPI, File, UploadFile
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Configure CORS for Vercel frontend (replace with your actual Vercel URL)
origins = ["https://potato-disease-detector.vercel.app/"]  # Update this with your Vercel URL

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Keras model using environment variable for path
model_path = os.getenv("MODEL_PATH", "../saved_models/2")  # Default to relative path if env var not set
MODEL = tf.keras.models.load_model(model_path)
CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]

@app.get("/ping")
async def ping():
    return {"message": "Hello, I am alive"}

# Function to read image from uploaded file
def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data)).convert("RGB")
    image = image.resize((256, 256))  # Adjust based on your model input size
    return np.array(image)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = read_file_as_image(await file.read())
        img_batch = np.expand_dims(image, 0)  # Shape: (1, 256, 256, 3)

        predictions = MODEL.predict(img_batch)
        predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
        confidence = float(np.max(predictions[0]))

        return {
            "class": predicted_class,
            "confidence": confidence
        }
    except Exception as e:
        return {"error": str(e)}