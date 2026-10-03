# AgriMitra

A crop information and leaf disease detection project for rice, cotton, maize,
and jowar. The frontend uses HTML, CSS, and JavaScript. A FastAPI backend runs
the included TensorFlow/Keras models to return a disease label and confidence.

## Run locally

Use Python 3.12. Run these commands from the repository root.

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
.venv\Scripts\python.exe -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

On macOS/Linux, use `.venv/bin/python` instead of `.venv\Scripts\python.exe`.
In a second terminal, start the frontend server from the repository root:

```sh
python -m http.server 5500 --bind 127.0.0.1
```

Open <http://127.0.0.1:5500>. The disease detection page sends requests to
`http://127.0.0.1:8000/predict`, configured in `js/disease.js`.
Visit <http://127.0.0.1:8000/health> to check which models loaded, or
<http://127.0.0.1:8000/docs> for the API documentation.

The dependency versions reflect the local development environment, except
`python-multipart`, which is required for file uploads and must be installed.
A fresh dependency installation and end-to-end inference still need validation.

## Project layout

```text
index.html                 Home and crop selection
crops.html                 Crop information
soil.html                  Soil guide
disease.html               Image upload and disease detection
css/style.css              Shared styles
js/main.js                 Crop selection behavior
js/disease.js              Upload and prediction interface
assets/images/             Image folders for each crop and UI assets
backend/app.py             FastAPI application
backend/requirements.txt   Backend dependencies
backend/models/            Four Keras models and cotton class metadata
backend/data/              Reserved disease information data
training/                  Crop training notebooks and results
datasets/                  Local training data (excluded from Git)
netlify.toml               Reserved deployment configuration
```

## Models and training

The four `.keras` files are included in the repository. The backend loads them
at startup and reports loading failures in the terminal. Class names are
configured in `backend/app.py`; their order must match each trained model.

Datasets are not included. Add your datasets under `datasets/<crop>/` and update
the dataset, model output, and sample image paths in the notebooks before running
them. The notebooks currently contain paths from the original Windows machine.
Training also requires Jupyter and, for the maize notebook, matplotlib:

```sh
python -m pip install jupyter matplotlib
```

`backend/data/disease_info.json` is an empty JSON object reserved for future use;
the current API does not read it.

## Hosting

The frontend is static; the Python API requires a separate Python service.
`netlify.toml` is currently a placeholder. Before deploying, configure the frontend
API URL for your hosted backend and review the backend's permissive CORS settings.
A static frontend deployment alone does not run disease detection.

## Push to GitHub

Create an empty GitHub repository without adding a README, license, or gitignore.
From this project directory, review and commit the files, then set your remote:

```sh
git add .
git diff --cached --stat
git commit -m "Initial AgriMitra project"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Local environments, secrets, caches, and dataset contents are excluded by
`.gitignore`. Empty asset and dataset folders are retained with `.gitkeep` files.
No license has been selected for this project.
