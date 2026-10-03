from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

import tensorflow as tf
import numpy as np
from PIL import Image

import io
import os


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="AgriMithra Crop Disease Detection API"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# MODEL DIRECTORY
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)


# =========================================================
# MODEL PATHS
# =========================================================

model_paths = {

    "maize": os.path.join(
        MODEL_DIR,
        "maize_model.keras"
    ),

    "cotton": os.path.join(
        MODEL_DIR,
        "cotton_model.keras"
    ),

    "jowar": os.path.join(
        MODEL_DIR,
        "jowar_model.keras"
    ),

    "rice": os.path.join(
        MODEL_DIR,
        "rice_model.keras"
    )
}


# =========================================================
# CLASS NAMES
# =========================================================

maize_classes = [
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy"
]


cotton_classes = [
    "Alternaria Leaf Spot",
    "Bacterial Blight",
    "Fusarium Wilt",
    "Healthy Leaf",
    "Verticillium Wilt"
]


jowar_classes = [
    "Anthracnose and Red Rot",
    "Cereal Grain molds",
    "Covered Kernel smut",
    "Head Smut",
    "Rust",
    "loose smut"
]


rice_classes = [
    "Bacterial Leaf Blight",
    "Brown Spot",
    "Healthy Rice Leaf",
    "Leaf Blast",
    "Leaf scald",
    "Sheath Blight"
]


# =========================================================
# CLASS DICTIONARY
# =========================================================

class_names = {

    "maize": maize_classes,

    "cotton": cotton_classes,

    "jowar": jowar_classes,

    "rice": rice_classes
}


# =========================================================
# LOAD ALL MODELS
# =========================================================

models = {}


print("\n======================================")
print("AgriMithra Backend Starting")
print("======================================\n")


for crop, path in model_paths.items():

    print(f"Loading {crop} model...")

    print(
        "Path:",
        path
    )


    if not os.path.exists(path):

        print(
            f"ERROR: {crop} model file not found."
        )

        print()

        continue


    try:

        models[crop] = tf.keras.models.load_model(
            path,
            compile=False
        )


        print(
            f"{crop} model loaded successfully!"
        )


        print(
            "Input shape:",
            models[crop].input_shape
        )


        print(
            "Output shape:",
            models[crop].output_shape
        )


        print()


    except Exception as e:

        print(
            f"ERROR loading {crop} model:"
        )

        print(e)

        print()


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {

        "message":
            "AgriMithra Disease Detection API",

        "models_loaded":
            list(models.keys())
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {

        "status":
            "running",

        "models_loaded":
            list(models.keys()),

        "total_models":
            len(models)
    }


# =========================================================
# PREDICT
# =========================================================

@app.post("/predict")
async def predict(

    crop: str = Form(...),

    image: UploadFile = File(...)

):

    # -----------------------------------------------------
    # NORMALIZE CROP NAME
    # -----------------------------------------------------

    crop = crop.lower().strip()


    # -----------------------------------------------------
    # CHECK CROP
    # -----------------------------------------------------

    if crop not in models:

        return {

            "error":
                f"Model for '{crop}' is not loaded.",

            "available_models":
                list(models.keys())
        }


    # -----------------------------------------------------
    # CHECK CLASS NAMES
    # -----------------------------------------------------

    if crop not in class_names:

        return {

            "error":
                f"Class names for '{crop}' are not configured."
        }


    try:

        # -------------------------------------------------
        # READ IMAGE
        # -------------------------------------------------

        contents = await image.read()


        # -------------------------------------------------
        # OPEN IMAGE
        # -------------------------------------------------

        img = Image.open(
            io.BytesIO(contents)
        ).convert("RGB")


        # -------------------------------------------------
        # GET CORRECT INPUT SIZE
        # -------------------------------------------------

        model = models[crop]

        input_shape = model.input_shape


        image_height = input_shape[1]

        image_width = input_shape[2]


        # -------------------------------------------------
        # RESIZE IMAGE
        # -------------------------------------------------

        img = img.resize(
            (
                image_width,
                image_height
            )
        )


        # -------------------------------------------------
        # CONVERT TO NUMPY
        # -------------------------------------------------

        img_array = np.array(
            img,
            dtype=np.float32
        )


        # -------------------------------------------------
        # ADD BATCH DIMENSION
        # -------------------------------------------------

        img_array = np.expand_dims(
            img_array,
            axis=0
        )


        # IMPORTANT:
        #
        # Do NOT divide by 255 here.
        #
        # These models were built with preprocessing /
        # Rescaling inside the model.


        # -------------------------------------------------
        # PREDICT
        # -------------------------------------------------

        predictions = model.predict(
            img_array,
            verbose=0
        )


        # -------------------------------------------------
        # CLASS INDEX
        # -------------------------------------------------

        predicted_index = int(
            np.argmax(
                predictions[0]
            )
        )


        # -------------------------------------------------
        # VERIFY CLASS COUNT
        # -------------------------------------------------

        number_of_outputs = len(
            predictions[0]
        )


        number_of_classes = len(
            class_names[crop]
        )


        if number_of_outputs != number_of_classes:

            return {

                "error":
                    "Model output classes do not match configured class names.",

                "model_outputs":
                    number_of_outputs,

                "configured_classes":
                    number_of_classes
            }


        # -------------------------------------------------
        # DISEASE
        # -------------------------------------------------

        predicted_disease = (
            class_names[crop]
            [predicted_index]
        )


        # -------------------------------------------------
        # CONFIDENCE
        # -------------------------------------------------

        confidence = float(
            predictions[0][predicted_index]
            * 100
        )


        # -------------------------------------------------
        # RETURN RESULT
        # -------------------------------------------------

        return {

            "crop":
                crop,

            "disease":
                predicted_disease,

            "confidence":
                round(
                    confidence,
                    2
                )
        }


    except Exception as e:

        print(
            f"Prediction error for {crop}:",
            e
        )


        return {

            "error":
                str(e)
        }