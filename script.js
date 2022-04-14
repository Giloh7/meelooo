console.clear();

let PPP1 = [0, 1, 4, 5, 2, 3, 6, 7];
let PPP2 = [0, 4, 1, 5, 2, 6, 3, 7];
let PPP3 = [0, 4, 2, 6, 1, 5, 3, 7];
let PPP4 = [0, 2, 1, 3, 4, 6, 5, 7];
let PPP5 = [0, 2, 4, 6, 1, 3, 5, 7];

PPPs = [PPP1, PPP2, PPP3, PPP4, PPP5];

let stopSignal = false;
let tempo = 130;
var NUM_STEPS = 128; // i.e. 8 bars
const HUMANIZE_SECONDS = 0.01;
var INSTRU = 10; // 2, 4, 10, 17
var newInterNoteSequences;
var Melos2Bar;
var Drums4Bar;

// Player and sound effect
const player = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
// const player = new core.SoundFontPlayer('https://storage.googleapis.com/download.magenta.tensorflow.org/soundfonts_js/salamander');

//Magenta - TensorFlow
url = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2';
urlDrum1 = 'https://storage.googleapis.com/download.magenta.tensorflow.org/models/music_vae/dljs/drums_lokl_q8';
urlDrum2 = 'https://storage.googleapis.com/download.magenta.tensorflow.org/models/music_vae/dljs/drums_hikl_q16';
urlDrum3 = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/groovae_4bar';

const modelDrum = new mm.MusicVAE(urlDrum3, conditionOnKey = false); //
const model = new mm.MusicVAE(url, conditionOnKey = false);

//Drums 
const generateDrums = () => {
  return modelDrum.sample(1, 0.5).
  then(function (samples) {
    Drums4Bar = samples;});
};

const generateMeloV2 = () => {
  return model.sample(1, 0.5).
  then(function (samples) {
    Melos2Bar = mm.sequences.split(samples[0], 32); //32Steps = 1 bar
    return model.interpolate([Melos2Bar[0], Melos2Bar[1]], 4);
  }).
  then(function (noteSequences) {
    // concatenateNoteSequence = mm.sequences.concatenate(noteSequences)
    noteSequences.forEach(function (sequence) {
      sequence.totalQuantizedSteps = 32;
    });
    newInterNoteSequences = mm.sequences.concatenate(noteSequences);
    // Loop on every note _ Set the intrument _ fix a duration bug
    for (const [i, note] of newInterNoteSequences.notes.entries()) {
      note.program = INSTRU; //Instrument
      note.velocity = 60;
      if (i !== newInterNoteSequences.notes.length - 1) {
        if (note.quantizedEndStep > newInterNoteSequences.notes[i + 1].quantizedStartStep) {
          note.quantizedEndStep = newInterNoteSequences.notes[i + 1].quantizedStartStep;
        }
      }
    };
    COLORS = shuffle(COLORS);
  });
};

const start = () => {
  stopSignal = true;
  player.stop();
  player.start(humanize(newInterNoteSequences), tempo);
};

const stop = () => {
  stopSignal = false;
  player.stop();
};

var buttonPlayStyle = 0,buttonStopStyle = 0,buttonBpmIncStyle = 0,buttonBpmDecrStyle = 0,buttonSaveStyle = 0;
var roundButtonWidth = 55;
var MENU_HEIGHT = 75;
var TILE_SIZE = 100;
var TILE_SIZE_REAL = TILE_SIZE * 4;
var WIDTH = TILE_SIZE * 8;
var HEIGHT = window.innerHeight - 100;
var NUM_NOTES = 88;
var MIDI_START_NOTE = 21;
var buttonPlay_x, buttonPlay_y, buttonStop_x, buttonStop_y, buttonBpmIncr_x, buttonBpmIncr_y, buttonSave_x, buttonSave_y, offset_x, offset_y;


function setup() {
  generateMeloV2();
  generateDrums();

  createCanvas(windowWidth, windowHeight);
  START_COLOR = color(1, 190, 254);
  END_COLOR = color(143, 0, 255);
  COLORS = [color(221, 96, 49), color(222, 60, 75), color(115, 29, 216), color(1, 22, 56),
  color(248, 221, 164), color(80, 216, 215), color(112, 162, 136), color(242, 175, 41)];
  noStroke();
}

function draw() {
  textFont('Nunito'); // Font
  background('#ffffff');
  fill(255);
  stroke('#bdbdbd'); // Dot color
  strokeWeight(3); // Dot thickness
  for (var i = 0; i < width; i = i + 80) {
    for (var j = 0; j < height; j = j + 80) {
      point(i, j);
    }
  }

  // Frame
  rectMode(CENTER);
  stroke(0);
  strokeWeight(3);
  rect(width / 2, height / 2, WIDTH, HEIGHT);
  strokeWeight(0);
  rectMode(CORNER);


  // Tiles 
  for (var i = 0; i < 8; i++) {
    offset_x = width / 2 - WIDTH / 2;
    offset_y = height / 2 - HEIGHT / 2;
    var x = offset_x + i * TILE_SIZE;
    var currColor = COLORS[i];
    fill(red(currColor), green(currColor), blue(currColor), 200);
    rect(x, offset_y, TILE_SIZE, HEIGHT);
    fill(currColor);
  }

  // Notes
  if (newInterNoteSequences) {
    drawNotes(newInterNoteSequences.notes, offset_x, offset_y + 1 / 3 * MENU_HEIGHT, WIDTH, HEIGHT - 1 / 3 * MENU_HEIGHT);
  };

  // Menu
  textAlign(LEFT);
  fill(0);
  textSize(10);
  text('Valentin Gillot ©', offset_x, offset_y + HEIGHT + 15);
  textSize(12);
  fill(230);
  strokeWeight(1);
  rect(offset_x, offset_y, WIDTH, MENU_HEIGHT); //Rect Menu
  strokeWeight(0);
  fill(0);
  if (overRegion(buttonPlay_x, buttonPlay_y - 14, 30, 15)) {
    strokeWeight(1);
  };
  buttonPlay_x = offset_x + 10;
  buttonPlay_y = offset_y + MENU_HEIGHT * 0.20;
  //text("Play",buttonPlay_x, buttonPlay_y);
  strokeWeight(0);
  if (overRegion(buttonStop_x, buttonStop_y - 14, 30, 15)) {
    strokeWeight(1);
  };
  buttonStop_x = offset_x + 10;
  buttonStop_y = offset_y + MENU_HEIGHT * 0.50;
  //text("Stop",buttonStop_x, buttonStop_y);
  strokeWeight(0);
  buttonBpmIncr_x = offset_x + 10;
  buttonBpmIncr_y = offset_y + MENU_HEIGHT * 0.20;
  text(tempo + " Bpm", offset_x + 10, buttonBpmIncr_y);
  // text("♪┌|∵|┘♪",buttonBpmIncr_x,offset_y + MENU_HEIGHT*0.5);
  textSize(10);
  text("Spacebar: New meeeloodies!", buttonBpmIncr_x, offset_y + MENU_HEIGHT * 0.5);
  text("V key: Variations of the meeeelooodyy!", buttonBpmIncr_x, offset_y + MENU_HEIGHT * 0.8);
  textSize(12);
  if (overRegion(buttonBpmIncr_x + 55, buttonBpmIncr_y - 14, 15, 15)) {
    strokeWeight(1);
  };
  text("+", buttonBpmIncr_x + 55, buttonBpmIncr_y);
  strokeWeight(0);
  if (overRegion(buttonBpmIncr_x + 70, buttonBpmIncr_y - 14, 15, 15)) {
    strokeWeight(1);
  };
  text("-", buttonBpmIncr_x + 70, buttonBpmIncr_y);
  strokeWeight(0);
  if (overRegion(buttonSave_x, buttonSave_y - 15, 30, 15)) {
    strokeWeight(1);
  };
  buttonSave_x = (width / 2 + WIDTH / 2) * 0.99;
  buttonSave_y = offset_y + MENU_HEIGHT * 0.2;
  textAlign(RIGHT);
  text("Save", buttonSave_x, buttonSave_y);
  text("(ﾉ･▿･)ﾉ     ", buttonSave_x, offset_y + MENU_HEIGHT * 0.5);

  strokeWeight(0);
  textAlign(CENTER);
  textSize(MENU_HEIGHT * 0.9);
  text("MEEELOO", width / 2, offset_y + MENU_HEIGHT * 0.8);
  // text("♪┏(・o･)┛ This is Meeeloo : it generates meeeeeloodies for you",width/2,offset_y +MENU_HEIGHT*0.2);
  textSize(10);
  //text("Melody generation experiment using Neural Net. Made with: p5.js - Magenta.js - Tone.js",width/2,offset_y +MENU_HEIGHT*0.4);
  textSize(12);
  text("Melody generation experiment using Neural Net. Made with: p5.js - Magenta.js - Tone.js", width / 2, offset_y + HEIGHT + 15);

  // text("SPACEBARﾉ => New meeeloodies!   ┗( ･o･)┓♪",width/2,offset_y +MENU_HEIGHT*0.8);
  // text("ヾ V key => Variation of the current meeeelooodyy!",width/2,offset_y +MENU_HEIGHT*0.5);
  fill(0);
  rectMode(CORNER);

  //Gradient
  colorMode(HSB);
  linearGradient(
  0, height / 2 - HEIGHT / 2, //Start point
  0, height / 2 + HEIGHT / 2, //End point
  color(360, 0, 100, 0), //Start color
  color(0, 0, 0, 100) //End color
  );
  rect(width / 2 - WIDTH / 2, height / 2 - HEIGHT / 2, WIDTH, HEIGHT);
  // rect(0, height/2+HEIGHT/2-80, 80, 80);
  colorMode(RGB);

  if (overRegion(offset_x, offset_y + MENU_HEIGHT, WIDTH, HEIGHT)) {
    rect(offset_x, offset_y, WIDTH, HEIGHT);
    textAlign(RIGHT);
    textSize(28);
    fill(180);
    if (stopSignal == false) {
      text(" ┗( ･o･)┓♪ Play", (width / 2 + WIDTH / 2) * 0.99, offset_y + HEIGHT * 0.98);
    } else
    {text("ヾ(*д*)ﾉ゛Stop", (width / 2 + WIDTH / 2) * 0.99, offset_y + HEIGHT * 0.98);}

    textSize(12);
    textAlign(LEFT);
  };

  //rect(buttonSave_x,buttonSave_y-15,30,15)
}

function mousePressed() {
  if (overRegion(buttonPlay_x, buttonPlay_y - 14, 30, 15)) {
    if (!newInterNoteSequences) {
      return;
    }
    start();
  }
  if (overRegion(buttonStop_x, buttonStop_y - 14, 30, 15)) {
    stop();
  }
  if (overRegion(buttonBpmIncr_x + 55, buttonBpmIncr_y - 14, 15, 15)) {
    tempo += 5;
  }
  if (overRegion(buttonBpmIncr_x + 65, buttonBpmIncr_y - 14, 15, 15)) {
    tempo -= 5;
  }
  if (overRegion(buttonSave_x, buttonSave_y - 15, 30, 15)) {
    saveSequence();
  }
  if (overRegion(offset_x, offset_y + MENU_HEIGHT, WIDTH, HEIGHT)) {
    if (stopSignal == false) {
      start();
    } else
    {
      stop();
    }
  }
}

function keyPressed() {
  if (key == ' ') {//this means space bar, since it is a space inside of the single quotes 
    stop();
    generateMeloV2();
  }
  if (keyCode === 86) {
    stop();
    applyPPP(newInterNoteSequences, shuffle(PPPs)[0]);
  }
}

function overRegion(locx, locy, locw, loch) {
  if (mouseX >= locx && mouseX <= locx + locw &&
  mouseY >= locy && mouseY <= locy + loch) {
    return true;
  } else
  {
    return false;
  }
} //overRegion()

function drawNotes(notes, x, y, width, height) {
  push();
  translate(x, y);
  var cellWidth = width / NUM_STEPS;
  var cellHeight = height / NUM_NOTES;
  // console.log(notes);
  notes.forEach(function (note) {
    var emptyNoteSpacer = 1;
    fill(204);
    fill(0);
    rect(emptyNoteSpacer + cellWidth * note.quantizedStartStep, height - cellHeight * (note.pitch - MIDI_START_NOTE),
    cellWidth * (note.quantizedEndStep - note.quantizedStartStep) - emptyNoteSpacer, cellHeight);
  });
  pop();
} // DrawNotes()


function showNote(seqList) {
  seqList.notes.forEach(function (note) {
    console.log(note);
  });
}

function humanize(s) {
  const seq = mm.sequences.clone(s);
  seq.notes.forEach(note => {
    let offset = HUMANIZE_SECONDS * (Math.random() - 0.5);
    if (seq.notes.startTime + offset < 0) {
      offset = -seq.notes.startTime;
    }
    if (seq.notes.endTime > seq.totalTime) {
      offset = seq.totalTime - seq.notes.endTime;
    }
    seq.notes.startTime += offset;
    seq.notes.endTime += offset;
  });
  return seq;
}

function saveSequence() {
  const midi = mm.sequenceProtoToMidi(newInterNoteSequences);
  const file = new Blob([midi], { type: 'audio/midi' });

  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(file, 'MyMeeeeloooo.mid');
  } else {// Others
    const a = document.createElement('a');
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = 'MyMeeeeloooo.mid';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
} //SaveSeq


function linearGradient(sX, sY, eX, eY, colorS, colorE) {
  let gradient = drawingContext.createLinearGradient(
  sX, sY, eX, eY);

  colorS.setAlpha(0);
  colorE.setAlpha(0.4);
  gradient.addColorStop(0, colorS);
  gradient.addColorStop(1, colorE);
  drawingContext.fillStyle = gradient;
  // drawingContext.strokeStyle = gradient;
}

//PPP function
function applyPPP(eightBarsNoteSeq, PPP) {
  COLORSCopy = COLORS.map(x => x);
  OldNoteSeq = mm.sequences.clone(eightBarsNoteSeq);
  NewNoteSeq = mm.sequences.clone(eightBarsNoteSeq);
  OldNoteSeq_1bars = mm.sequences.split(OldNoteSeq, 16);
  NewNoteSeq_1bars = mm.sequences.split(NewNoteSeq, 16);
  for (const [i, segment] of NewNoteSeq_1bars.entries()) {
    NewNoteSeq_1bars[i] = OldNoteSeq_1bars[PPP[i]];
    COLORS[i] = COLORSCopy[PPP[i]];
  }
  NewNoteSeq = mm.sequences.concatenate(NewNoteSeq_1bars);
  newInterNoteSequences = NewNoteSeq;
}


//Audio effects
// const globalCompressor = new mm.Player.tone.MultibandCompressor();
// const globalReverb = new mm.Player.tone.Freeverb(0.25);
// const globalLimiter = new mm.Player.tone.Limiter();
// globalCompressor.connect(globalReverb);
// globalReverb.connect(globalLimiter);
// globalLimiter.connect(mm.Player.tone.Master);

// Suivi visuel des notes
// Ajout des PPPs
// Ajouter Batterie