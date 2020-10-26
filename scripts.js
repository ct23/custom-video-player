/* Get our elements */
const player = document.querySelector(".player");
const video = player.querySelector(".viewer");
const progress = player.querySelector(".progress");
const progressBar = player.querySelector(".progress__filled");
const toggle = player.querySelector(".toggle");
const skipButtons = player.querySelectorAll("[data-skip]");
const ranges = player.querySelectorAll(".player__slider");
//create recofnitiion variable
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true; //allows for pause before recognizing speech again


/* For uploaded video: */
var uploadedVideoURL;


/* Build out functions */
function togglePlay() {
  const method = video.paused ? "play" : "pause";
  video[method]();
}

function updateButton() {
  const icon = this.paused ? "►" : "❚ ❚";
  toggle.textContent = icon;
}

function skip() {
  video.currentTime += parseFloat(this.dataset.skip);
}

function handleRangeUpdate() {
  video[this.name] = this.value;
}

function handleProgress() {
  const percent = (video.currentTime / video.duration) * 100;
  progressBar.style.flexBasis = `${percent}%`;
}

function scrub(e) {
  const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
  video.currentTime = scrubTime;
}
function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 4; // RED
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue

  }
  return pixels;
  // adding function to test if pushing works in Github.  It has no functional significance yet.
}

/* Hook up event listeners */
video.addEventListener("click", togglePlay);
toggle.addEventListener("click", togglePlay);

video.addEventListener("play", updateButton);
video.addEventListener("pause", updateButton);
video.addEventListener("timeupdate", handleProgress);

skipButtons.forEach((button) => button.addEventListener("click", skip));

ranges.forEach((range) => range.addEventListener("change", handleRangeUpdate));
ranges.forEach((range) =>
  range.addEventListener("mousemove", handleRangeUpdate)
);

let mousedown = false;
progress.addEventListener("click", scrub);
progress.addEventListener("mousemove", (e) => mousedown && scrub(e));
progress.addEventListener("mousedown", () => (mousedown = true));
progress.addEventListener("mouseup", () => (mousedown = false));

/* Cloudinary upload widget scripts */
var myUploadWidget = cloudinary.createUploadWidget(
  {
    cloudName: "dyshaayv9",
    uploadPreset: "uipflmhb"
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      console.log("Done! Here is the image info: ", result.info);
      // Set uploadedVideoURL to the full public URL for video
      uploadedVideoURL = "https://res.cloudinary.com/dyshaayv9/video/upload/" + result.info.public_id;
      // Set value of url_box to uploadedVideoURL
      document.getElementById("url_box").value = uploadedVideoURL;
      // Update video player to utilize the URL of new video
      video.src = uploadedVideoURL;
    }
  }
);

document.getElementById("upload_widget").addEventListener(
  "click",
  function () {
    myUploadWidget.open();
  },
  false
);


// Create new paragraph after each pause
let p = document.createElement('p');

//Event Listener for "result"
recognition.addEventListener('result', e => {
  const transcript = Array.from(e.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join('')
  console.log(transcript);

  const confidence = Array.from(e.results)
    .map(result => result[0])
    .map(result => result.confidence)
    .join('')
  console.log(confidence);

  if (transcript.includes('play') || (transcript.includes('pause')) &&  confidence > .92) {
    togglePlay();
  }
});

recognition.addEventListener('end', recognition.start);
recognition.start();
