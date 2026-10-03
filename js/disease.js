// ==========================================
// AGRIMITRA DISEASE DETECTION
// ==========================================

let selectedDiseaseCrop = null;
let selectedImage = null;


// ==========================================
// BACKEND URL
// ==========================================

const API_URL =
    "http://127.0.0.1:8000/predict";


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const savedCrop =
            localStorage.getItem(
                "agrimitraSelectedCrop"
            );

        if (savedCrop) {
            selectDiseaseCrop(savedCrop);
        }


        const fileInput =
            document.getElementById(
                "leafImage"
            );

        if (fileInput) {

            fileInput.addEventListener(
                "change",
                handleImageSelection
            );

        }


        setupDragAndDrop();
        updateAnalyzeButton();
    }
);


// ==========================================
// SELECT CROP
// ==========================================

function selectDiseaseCrop(crop) {

    selectedDiseaseCrop = crop;

    localStorage.setItem(
        "agrimitraSelectedCrop",
        crop
    );


    const cropCards =
        document.querySelectorAll(
            ".disease-crop-card"
        );


    cropCards.forEach(
        function (card) {

            card.classList.remove(
                "selected"
            );

        }
    );


    const selectedCard =
        document.querySelector(
            `[data-crop="${crop}"]`
        );


    if (selectedCard) {

        selectedCard.classList.add(
            "selected"
        );

    }


    updateAnalyzeButton();
}


// ==========================================
// OPEN FILE PICKER
// ==========================================

function openFilePicker() {

    const input =
        document.getElementById(
            "leafImage"
        );

    if (input) {
        input.click();
    }
}


// ==========================================
// IMAGE SELECTION
// ==========================================

function handleImageSelection(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    processImage(file);
}


// ==========================================
// PROCESS IMAGE
// ==========================================

function processImage(file) {

    if (!file.type.startsWith("image/")) {

        alert(
            "Please select a valid image."
        );

        return;
    }


    selectedImage = file;


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            const preview =
                document.getElementById(
                    "imagePreview"
                );


            preview.src =
                event.target.result;


            document
                .getElementById(
                    "uploadContent"
                )
                .style.display =
                "none";


            document
                .getElementById(
                    "imagePreviewContainer"
                )
                .style.display =
                "flex";


            document
                .getElementById(
                    "imageActions"
                )
                .style.display =
                "flex";


            // Hide old prediction
            document
                .getElementById(
                    "predictionSection"
                )
                .style.display =
                "none";


            const message =
                document.getElementById(
                    "analysisMessage"
                );


            if (message) {

                message.textContent =
                    "Image ready for analysis.";

            }


            updateAnalyzeButton();
        };


    reader.readAsDataURL(file);
}


// ==========================================
// CHANGE IMAGE
// ==========================================

function changeImage(event) {

    event.stopPropagation();


    document
        .getElementById(
            "leafImage"
        )
        .click();
}


// ==========================================
// REMOVE IMAGE
// ==========================================

function removeImage(event) {

    if (event) {
        event.stopPropagation();
    }


    selectedImage = null;


    const fileInput =
        document.getElementById(
            "leafImage"
        );


    if (fileInput) {
        fileInput.value = "";
    }


    document
        .getElementById(
            "imagePreview"
        )
        .src = "";


    document
        .getElementById(
            "uploadContent"
        )
        .style.display =
        "block";


    document
        .getElementById(
            "imagePreviewContainer"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "imageActions"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "predictionSection"
        )
        .style.display =
        "none";


    const message =
        document.getElementById(
            "analysisMessage"
        );


    if (message) {
        message.textContent = "";
    }


    updateAnalyzeButton();
}


// ==========================================
// ENABLE / DISABLE ANALYZE
// ==========================================

function updateAnalyzeButton() {

    const button =
        document.getElementById(
            "analyzeButton"
        );


    if (!button) {
        return;
    }


    if (
        selectedDiseaseCrop &&
        selectedImage
    ) {

        button.disabled = false;

    }

    else {

        button.disabled = true;

    }
}


// ==========================================
// DRAG AND DROP
// ==========================================

function setupDragAndDrop() {

    const uploadBox =
        document.getElementById(
            "uploadBox"
        );


    if (!uploadBox) {
        return;
    }


    uploadBox.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadBox.classList.add(
                "dragging"
            );

        }
    );


    uploadBox.addEventListener(
        "dragleave",
        function () {

            uploadBox.classList.remove(
                "dragging"
            );

        }
    );


    uploadBox.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();


            uploadBox.classList.remove(
                "dragging"
            );


            const file =
                event.dataTransfer.files[0];


            if (file) {
                processImage(file);
            }

        }
    );
}


// ==========================================
// ANALYZE LEAF USING FASTAPI
// ==========================================

async function analyzeLeaf() {

    if (!selectedDiseaseCrop) {

        alert(
            "Please select a crop."
        );

        return;
    }


    if (!selectedImage) {

        alert(
            "Please upload a leaf image."
        );

        return;
    }


    const button =
        document.getElementById(
            "analyzeButton"
        );


    const message =
        document.getElementById(
            "analysisMessage"
        );


    button.disabled = true;

    button.textContent =
        "Analyzing...";


    message.textContent =
        "Analyzing leaf using ML model...";


    // --------------------------------------
    // PREPARE DATA FOR FASTAPI
    // --------------------------------------

    const formData =
        new FormData();


    // Convert Rice -> rice,
    // Cotton -> cotton, etc.

    formData.append(
        "crop",
        selectedDiseaseCrop
            .toLowerCase()
            .trim()
    );


    formData.append(
        "image",
        selectedImage
    );


    try {

        // ----------------------------------
        // SEND REQUEST TO FASTAPI
        // ----------------------------------

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",
                    body: formData
                }
            );


        // ----------------------------------
        // READ RESPONSE
        // ----------------------------------

        const data =
            await response.json();


        console.log(
            "AgriMithra prediction:",
            data
        );


        // ----------------------------------
        // HTTP ERROR
        // ----------------------------------

        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.error ||
                "Prediction request failed."
            );

        }


        // ----------------------------------
        // BACKEND ERROR
        // ----------------------------------

        if (data.error) {

            throw new Error(
                data.error
            );

        }


        // ----------------------------------
        // DISPLAY RESULT
        // ----------------------------------

        showPrediction(data);


        message.textContent =
            "Analysis completed successfully.";

    }

    catch (error) {

        console.error(
            "Prediction error:",
            error
        );


        message.textContent =
            "Prediction failed: " +
            error.message;


        alert(
            "Prediction failed.\n\n" +
            error.message
        );

    }

    finally {

        button.disabled = false;

        button.textContent =
            "🔬 Analyze Leaf";

    }
}


// ==========================================
// SHOW ML PREDICTION
// ==========================================

function showPrediction(data) {

    // --------------------------------------
    // DISEASE
    // --------------------------------------

    const diseaseElement =
        document.getElementById(
            "resultDisease"
        );


    if (diseaseElement) {

        diseaseElement.textContent =
            data.disease;

    }


    // --------------------------------------
    // CONFIDENCE
    // --------------------------------------

    // --------------------------------------
    // CONFIDENCE
    // --------------------------------------

    const confidenceElement =
        document.getElementById(
            "resultConfidence"
        );

    if (confidenceElement) {

        confidenceElement.textContent =
            data.confidence + "%";

    }


    // --------------------------------------
    // SYMPTOMS
    // Currently backend doesn't return this
    // --------------------------------------

    const symptomsElement =
        document.getElementById(
            "resultSymptoms"
        );


    if (symptomsElement) {

        symptomsElement.textContent =
            data.symptoms ||
            "Disease information will be added soon.";

    }


    // --------------------------------------
    // TREATMENT
    // --------------------------------------

    const treatmentElement =
        document.getElementById(
            "resultTreatment"
        );


    if (treatmentElement) {

        treatmentElement.textContent =
            data.treatment ||
            "Treatment information will be added soon.";

    }


    // --------------------------------------
    // PREVENTION
    // --------------------------------------

    const preventionElement =
        document.getElementById(
            "resultPrevention"
        );


    if (preventionElement) {

        preventionElement.textContent =
            data.prevention ||
            "Prevention information will be added soon.";

    }


    // --------------------------------------
    // SHOW RESULT SECTION
    // --------------------------------------

    const predictionSection =
        document.getElementById(
            "predictionSection"
        );


    if (predictionSection) {

        predictionSection.style.display =
            "block";


        predictionSection.scrollIntoView(
            {
                behavior: "smooth",
                block: "start"
            }
        );

    }
}


// ==========================================
// SCAN AGAIN
// ==========================================

function scanAgain() {

    removeImage();


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );
}