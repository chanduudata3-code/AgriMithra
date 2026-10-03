// ==========================================
// AGRIMITRA MAIN JAVASCRIPT
// ==========================================

let selectedCrop = null;


// ==========================================
// SELECT CROP
// ==========================================

function selectCrop(crop) {

    selectedCrop = crop;

    // Save crop so other pages can access it
    localStorage.setItem("agrimitraSelectedCrop", crop);


    // Remove selected style from all crop cards
    const cropCards =
        document.querySelectorAll(".select-crop-card");

    cropCards.forEach(function (card) {

        card.classList.remove("selected");

    });


    // Highlight selected crop
    const selectedCard =
        document.querySelector(
            `[data-crop="${crop}"]`
        );

    if (selectedCard) {

        selectedCard.classList.add("selected");

    }


    // Update selected crop text
    const selectedCropName =
        document.getElementById("selectedCropName");

    if (selectedCropName) {

        selectedCropName.textContent = crop;

    }


    // Enable continue button
    const continueButton =
        document.getElementById("continueButton");

    if (continueButton) {

        continueButton.disabled = false;

    }

}


// ==========================================
// CONTINUE TO DISEASE DETECTION
// ==========================================

function continueToDisease() {

    if (!selectedCrop) {

        alert("Please select a crop first.");

        return;
    }

    window.location.href = "disease.html";

}


// ==========================================
// RESTORE PREVIOUS SELECTION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const savedCrop =
            localStorage.getItem(
                "agrimitraSelectedCrop"
            );


        if (savedCrop) {

            selectedCrop = savedCrop;


            const selectedCard =
                document.querySelector(
                    `[data-crop="${savedCrop}"]`
                );

            if (selectedCard) {

                selectedCard.classList.add(
                    "selected"
                );

            }


            const selectedCropName =
                document.getElementById(
                    "selectedCropName"
                );

            if (selectedCropName) {

                selectedCropName.textContent =
                    savedCrop;

            }


            const continueButton =
                document.getElementById(
                    "continueButton"
                );

            if (continueButton) {

                continueButton.disabled =
                    false;

            }

        }


        console.log(
            "AgriMitra loaded successfully"
        );

    }
);