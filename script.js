document.getElementById('plant-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const plantType = document.getElementById('plant-type').value;
    const symptoms = document.getElementById('symptoms').value
        .split(',')
        .map(item => item.trim().toLowerCase());

    const deficiencies = checkDeficiencies(symptoms);

    displayResult(deficiencies);
});

function checkDeficiencies(symptoms) {
    const nutrientSymptoms = {
        nitrogen: ['yellowing leaves', 'stunted growth'],
        phosphorus: ['purple leaves', 'slow growth'],
        potassium: ['brown leaf edges', 'weak stems'],
        magnesium: ['interveinal chlorosis', 'leaf curling'],
        iron: ['interveinal chlorosis', 'yellowing new leaves']
    };

    const deficiencies = [];
    for (const nutrient in nutrientSymptoms) {
        if (nutrientSymptoms[nutrient].some(symptom => symptoms.includes(symptom))) {
            deficiencies.push(nutrient);
        }
    }
    return deficiencies;
}

function displayResult(deficiencies) {
    const resultDiv = document.getElementById('result');
    if (deficiencies.length === 0) {
        resultDiv.textContent = 'No deficiencies detected!';
    } else {
        resultDiv.textContent = 'Deficiencies detected in: ' + deficiencies.join(', ');
    }
}




document.addEventListener('DOMContentLoaded', () => {
    const plantForm = document.getElementById('plant-form');
    const video = document.getElementById('video');
    const canvasCamera = document.getElementById('canvasCamera');
    const resultCamera = document.getElementById('resultCamera');
    const captureButton = document.getElementById('captureButton');
    const imageUpload = document.getElementById('imageUpload');
    const canvasUpload = document.getElementById('canvasUpload');
    const resultUpload = document.getElementById('resultUpload');

    // Initialize Camera
    function initializeCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    video.srcObject = stream;
                })
                .catch((err) => {
                    console.error("Error accessing the camera: ", err);
                    resultCamera.textContent = "Unable to access the camera. Please check your permissions or try another browser.";
                });
        } else {
            console.error("getUserMedia is not supported on this browser.");
            resultCamera.textContent = "Camera access is not supported by your browser.";
        }
    }

    // Analyze Image Data
    function analyzeImage(data, width, height) {
        let paleCount = 0, yellowCount = 0, rednessCount = 0, darkCirclesCount = 0;
        let totalPixels = data.length / 4;

        const deficiencies = {
            'Iron Deficiency (Anemia)': 0,
            'Vitamin B12 Deficiency': 0,
            'Vitamin D Deficiency': 0,
            'Vitamin C Deficiency': 0,
        };

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];

            if (r > 200 && g > 200 && b > 200) paleCount++;
            if (r > 200 && g > 200 && b < 150) yellowCount++;
            if (r > 180 && g < 100 && b < 100) rednessCount++;
            if (r < 100 && g < 80 && b < 80) darkCirclesCount++;
        }

        const palePercentage = (paleCount / totalPixels) * 100;
        const yellowPercentage = (yellowCount / totalPixels) * 100;
        const rednessPercentage = (rednessCount / totalPixels) * 100;
        const darkCirclesPercentage = (darkCirclesCount / totalPixels) * 100;

        if (palePercentage > 30) deficiencies['Iron Deficiency (Anemia)']++;
        if (yellowPercentage > 20) deficiencies['Vitamin B12 Deficiency']++;
        if (rednessPercentage > 15) deficiencies['Vitamin D Deficiency']++;
        if (darkCirclesPercentage > 10) deficiencies['Vitamin C Deficiency']++;

        let resultText = 'Detected Possible Deficiencies:\n';
        Object.keys(deficiencies).forEach((deficiency) => {
            if (deficiencies[deficiency] > 0) {
                resultText += `${deficiency}\n`; // Fixed string interpolation
            }
        });

        return resultText.trim() || 'No significant signs of nutritional deficiency detected.';
    }

    // Camera Capture Button
    captureButton.addEventListener('click', () => {
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            resultCamera.textContent = "Camera is not ready. Please wait.";
            return;
        }

        canvasCamera.width = video.videoWidth;
        canvasCamera.height = video.videoHeight;

        const ctx = canvasCamera.getContext('2d');
        ctx.drawImage(video, 0, 0, canvasCamera.width, canvasCamera.height);

        const imageData = ctx.getImageData(0, 0, canvasCamera.width, canvasCamera.height);
        const analysisResult = analyzeImage(imageData.data, canvasCamera.width, canvasCamera.height);

        resultCamera.textContent = analysisResult;
    });

    // Image Upload Handler
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;
                img.onload = () => {
                    canvasUpload.width = img.width;
                    canvasUpload.height = img.height;

                    const ctx = canvasUpload.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvasUpload.width, canvasUpload.height);
                    const analysisResult = analyzeImage(imageData.data, canvasUpload.width, canvasUpload.height);

                    resultUpload.textContent = analysisResult;
                };
            };

            reader.readAsDataURL(file);
        } else {
            resultUpload.textContent = 'Invalid file type. Please upload an image.';
        }
    });

    // Initialize Camera on Load
    initializeCamera();
});
