const URL = "./model/";

let model, webcam, labelContainer, maxPredictions;
const ICA_THRESHOLD = 0.75;
let birthdayMessageTimeout = null;
let icaDetectionStartTime = null;
let birthdayMessageShown = false;
const DETECTION_DURATION = 1000;
const MESSAGE_DURATION = 5000;

async function init() {
	const modelURL = URL + "model.json";
	const metadataURL = URL + "metadata.json";

	model = await tmImage.load(modelURL, metadataURL);
	maxPredictions = model.getTotalClasses();

	const flip = true; 
	webcam = new tmImage.Webcam(200, 200, flip);
	await webcam.setup();
	await webcam.play();
	window.requestAnimationFrame(loop);

	document.getElementById("webcam-containers").appendChild(webcam.canvas);
	labelContainer = document.getElementById("label-container");
	for (let i = 0; i < maxPredictions; i++) {
		labelContainer.appendChild(document.createElement("div"));
	}
}

async function loop() {
	webcam.update();
	await predict();
	window.requestAnimationFrame(loop);
}

async function predict() {
	const prediction = await model.predict(webcam.canvas);
	let icaDetected = false;
	
	for (let i = 0; i < maxPredictions; i++) {
		const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
		labelContainer.childNodes[i].innerHTML = classPrediction;
		
		if (prediction[i].className.toLowerCase() === "ica" && prediction[i].probability >= ICA_THRESHOLD) {
			icaDetected = true;
		}
	}
	
	const currentTime = Date.now();
	
	if (icaDetected) {
		if (icaDetectionStartTime === null) {
			icaDetectionStartTime = currentTime;
		}
		
		const detectionDuration = currentTime - icaDetectionStartTime;
		if (detectionDuration >= DETECTION_DURATION && !birthdayMessageShown) {
			showBirthdayMessage();
		}
	} else {
		icaDetectionStartTime = null;
		birthdayMessageShown = false;
	}
}

function showBirthdayMessage() {
	const birthdayElement = document.getElementById('birthday-message');
	const birthdayAudio = document.getElementById('birthday-audio');

	console.log('semoga ica panjang umur, sehat selalu, bahagia selalu, sukses selalu, rajin menabung selalu, buang sampah pada tempatnya selalu, tidak kencing sembarangan selalu, tidak begadang selalu, cantik selalu, manis selalu, hot selalu, ahhhh 🥵. Happy birthday!');
	
	birthdayMessageShown = true;
	
	if (birthdayMessageTimeout) {
		clearTimeout(birthdayMessageTimeout);
	}
	
	birthdayElement.classList.add('show');
	
	birthdayAudio.currentTime = 0;
	birthdayAudio.play().catch(error => {
		console.log('Audio play failed:', error);
	});
	
	birthdayMessageTimeout = setTimeout(() => {
		birthdayElement.classList.remove('show');
		birthdayAudio.pause();
		birthdayAudio.currentTime = 0;
		
		birthdayMessageTimeout = null;
		birthdayMessageShown = false;
		icaDetectionStartTime = null;
	}, MESSAGE_DURATION);
}