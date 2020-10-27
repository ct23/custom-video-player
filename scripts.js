/* Get our elements */
const player = document.querySelector(".player");
const video = player.querySelector(".viewer");
const progress = player.querySelector(".progress");
const progressBar = player.querySelector(".progress__filled");
const toggle = player.querySelector(".toggle");
const skipButtons = player.querySelectorAll("[data-skip]");
const skipButtonAhead = player.querySelector('button[data-skip="25"]');
const skipButtonBack = player.querySelector('button[data-skip="-10"]');
const ranges = player.querySelectorAll(".player__slider");
const volumerange = player.querySelector('input[name="volume"]');
const playbackrate = player.querySelector('input[name="playbackRate"]');
//create recognitiion variable
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new window.SpeechRecognition();
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
  console.log(video.currentTime);
  console.log(video.duration);

  video.currentTime += parseFloat(this.dataset.skip);
}

function skipAhead() {
  console.log("skipAhead: ");
  console.log(skipButtonAhead);
  video.currentTime += parseFloat(skipButtonAhead.dataset.skip);
}

function skipBack() {
  console.log("skipBack: ");
  console.log(skipButtonBack);
  video.currentTime += parseFloat(skipButtonBack.dataset.skip);
}

function restart() {
  console.log("restart: ");
  console.log(video.currentTime);
  video.currentTime = 2;
  console.log(video.currentTime);
}


function handleRangeUpdate() {
  video[this.name] = this.value;
  // console.log(this);
  console.log(this.name);
  console.log(this.value);
}

function handleRangeUpdateVoiceUp() {
  const currentVolume = parseFloat(volumerange.value);
  volumerange.value = currentVolume + 0.1;
  console.log("volumerange.value: " , volumerange.value);
  video["volume"] = (volumerange.value);
}

function handleRangeUpdateVoiceDown() {
  console.log(typeof volumerange.value);
  volumerange.value -=  0.1;
  console.log("volumerange.value: " + volumerange.value);
  video["volume"] = (volumerange.value);
}

function handleRangeUpdatePlaySpeedUp() {
  const currentSpeed = parseFloat(playbackrate.value);
  playbackrate.value =  currentSpeed + 0.1;
  console.log("playbackrate.value: " + playbackrate.value);
  video["playbackRate"] = (playbackrate.value);
}

function handleRangeUpdatePlaySpeedDown() {
  console.log(typeof playbackrate.value);
  playbackrate.value -=  0.1;
  console.log("playbackrate.value: " + playbackrate.value);
  video["playbackRate"] = (playbackrate.value);
}

function backToNormal() {
  volumerange.value = 1;
  playbackrate.value = 1;
  console.log(volumerange.value);
  console.log(playbackrate.value);
}

function handleProgress() {
  const percent = (video.currentTime / video.duration) * 100;
  progressBar.style.flexBasis = `${percent}%`;
  console.log(progressBar.style.flexBasis)
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

// Create new paragraph after each pause
let p = document.createElement('p');

//Event Listener for "result"
recognition.addEventListener('result', e => {
  const transcript = Array.from(e.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join('');
  console.log(transcript);

  const confidence = Array.from(e.results)
    .map(result => result[0])
    .map(result => result.confidence)
    .join('');
  // console.log(confidence);

  if (transcript.includes('play') || (transcript.includes('pause')) &&  confidence > .92) {
    togglePlay();
  }


  if (transcript.includes('volume up') || (transcript.includes('louder')) &&  confidence > .95) {
    handleRangeUpdateVoiceUp();
  }

  if (transcript.includes('volume down') || (transcript.includes('quite')) &&  confidence > .95) {
    handleRangeUpdateVoiceDown();
  }

  if (transcript.includes('speed up') || (transcript.includes('quickly quickly')) &&  confidence > .95) {
    handleRangeUpdatePlaySpeedUp();
  }

  if (transcript.includes('slow down') || (transcript.includes('slowly slowly')) &&  confidence > .95) {
    handleRangeUpdatePlaySpeedDown();
  }

  if (transcript.includes('normalize') || (transcript.includes('back to normal')) &&  confidence > .95) {
    backToNormal();
  }


  if (transcript.includes('skip forward') || (transcript.includes('skip ahead')) &&  confidence > .95) {
    skipAhead();
  }
  if (transcript.includes('skip back') || (transcript.includes('back 10 seconds')) &&  confidence > .95) {
    skipBack();
  }

  
  if (transcript.includes('restart') || (transcript.includes('play again')) &&  confidence > .95) {
    restart();
  }


});

recognition.addEventListener('end', recognition.start);
recognition.start();
