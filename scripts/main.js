//Init Work
const myConsole = document.getElementById("console");
const searchList = [];
const pastCommands = [];
let lastCommandPos = 0;
let musicApiLoaded = false;
const music = document.getElementById("music");
const locatorPrefix = "$root:";
let headerLines = [
  "A Rogue Terminal",
  "Copyright (C) A Rogue Otaku. No rights reserved.",
  "",
  "v 0.1",
];
const consoleMessages = [
  {
    text: "🛑STOP🛑",
    style: `background-color: red;
    font-size: 70px;
    border: 5px ridge white;
    padding: 10px;
    font-weight: bolder;
    margin: 10px;
    border-radius: 5px;
    font-family: monospace;`,
  },
  {
    text: "🛠 Tinker at your own Risk 🛠",
    style: `color: orange;
    font-size: 30px;
    text-decoration: underline;
    font-family: monospace;`,
  },
  {
    text: "A Rogue Terminal",
    style: `font-size: 12px;
    margin-left: 10px;
    font-family: monospace;`,
  },
  {
    text: "v 0.1",
    style: `font-size: 10px;
    margin-left: 10px;
    font-family: monospace;`,
  },
];
loadMusicAPI("https://yd-loader.glitch.me/keepawake");

//Command Related Methods
//Clears the Console
function clear() {
  while (myConsole.firstChild) myConsole.removeChild(myConsole.firstChild);
}

//Play by ID or Search Term(defaults to Search Term)
async function playMusic(...args) {
  if (!musicApiLoaded) {
    insertLine(
      "The Music Api is still Loading. Please try again in a few seconds."
    );
    return;
  }
  switch (args[0]) {
    case "-id":
      if (!args[1] || args[1].length === 0) {
        insertLine("No Video ID found.");
        insertLine("Usage: play [-id|-st] [videoid|searchterm]");
      } else {
        insertLine("Searching...");
        await playById(music, args[1]);
      }
      break;
    case "-st":
      if (!args[1] || args[1].length === 0) {
        insertLine("No Search Term found.");
        insertLine("Usage: play [-id|-st] [videoid|searchterm]");
      } else {
        insertLine("Searching...");
        await playBySearchTerm(music, args[1]);
      }
      break;
    case "-q":
      if (args[1] && args[1].length && !isNaN(parseInt(args[1]))) {
        await playQueue(music, parseInt(args[1]) - 1);
      } else {
        await playQueue(music, currentQueuePos);
      }
      break;
    case "-h":
      insertLine("Usage: play [-id|-st] [videoid|searchterm]");
      break;
    case undefined:
      await play(music);
      break;
    default:
      insertLine("Searching...");
      await playBySearchTerm(music, args[0]);
  }
}

//Sets the Audio Volume
function setVolume(...args) {
  const vol = args[0];
  if (vol === "-h") {
    insertLine("Usage: volume [0.0 - 1.0]");
    return;
  }
  if (!vol || vol.length <= 0) {
    insertLine("Volume: " + music.volume);
    return;
  }
  volume(music, vol);
}

//Sets the Music Loop Type
function setLoopType(...args) {
  let type = undefined;
  switch (args[0]) {
    case "-off":
      type = 0;
      break;
    case "-on":
      if (args[1] === "2") type = 2;
      else if (args[1] === "1") type = 1;
      else if (args[1] === undefined) type = 1;
      else {
        insertLine("Invalid Loop Type");
        insertLine("Usage: loop [-off|-on] [1|2]");
      }
      break;
    case "-h":
      insertLine("Usage: loop [-off|-on] [1|2]");
      break;
    case undefined:
      type = 1;
      break;
    default:
      insertLine("Usage: loop [-off|-on] [1|2]");
  }
  if (type != undefined) {
    loop(type);
    insertLine(
      "Loop Music is now: " +
        (type === 0 ? "Off" : type === 1 ? "Playlist Repeat" : "Single Repeat")
    );
  }
}

//Queue related Ops
async function queueOps(...args) {
  switch (args[0]) {
    case undefined:
      showMusicList(currentQueue);
      break;
    case "-l":
      showMusicList(currentQueue);
      break;
    case "-h":
      insertLine("Usage: queue [-s|-a] [-id|-st] [videoid|searchterm]");
      break;
    case "-s":
      showMusicList(currentQueue);
      break;
    case "-add":
      switch (args[1]) {
        case "-id":
          if (!args[2] || args[2].length === 0) {
            insertLine("No Video ID found.");
            insertLine("Usage: queue [-s|-a] [-id|-st] [videoid|searchterm]");
          } else {
            insertLine("Searching...");
            await addById(args[2]);
          }
          break;
        case "-st":
          if (!args[2] || args[2].length === 0) {
            insertLine("No Search Term found.");
            insertLine("Usage: queue [-s|-a] [-id|-st] [videoid|searchterm]");
          } else {
            insertLine("Searching...");
            await addBySearchTerm(args[2]);
          }
          break;
        case undefined:
          insertLine("Usage: queue [-s|-a] [-id|-st] [videoid|searchterm]");
          break;
        default:
          insertLine("Searching...");
          await addBySearchTerm(args[1]);
      }
      break;
    case "-clr":
      clearQueue(args[1]);
      break;
    default:
      insertLine("Searching...");
      await addBySearchTerm(args[0]);
  }
}

//Play Next Music in Queue
async function playNext(...args) {
  await next(music);
}

//Play Previous Music in Queue
async function playPrevious(...args) {
  await prev(music);
}

//Command Object
const commandList = {
  clear,
  cls: clear,
  play: playMusic,
  pause: () => {
    pause(music);
  },
  stop: () => {
    stop(music);
  },
  volume: setVolume,
  loop: setLoopType,
  queue: queueOps,
  next: playNext,
  prev: playPrevious,
};

//Utility Work
//Run Latest Command
async function run() {
  const currentCommand = document.querySelector(".current-command");
  const line = currentCommand.querySelector(".line");
  line.setAttribute("contenteditable", false);
  const commandWhole = line.innerText;
  const [commandValue, ...args] =
    commandWhole
      .replace(new RegExp(String.fromCharCode(160), "g"), " ")
      .match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  if (commandValue) {
    addCommandList(commandWhole);
    if (commandList[commandValue]) {
      await commandList[commandValue](...args);
    } else if (commandValue.length > 0) {
      insertLine("Invalid Command.");
    }
    insertBlankLine();
  }
  currentCommand.classList.remove("current-command");
  insertCommand();
}

//Load music API
async function loadMusicAPI(url) {
  try {
    const res = await fetch(url);
    if (res.status !== 200) {
      insertLine(
        "Could not Load Music API at this time. Reason: " +
          (res.statusText || (await res.text()))
      );
      run();
    } else musicApiLoaded = true;
  } catch (e) {
    insertLine("Could not Load Music API at this time. Reason: " + e.message);
    run();
  }
}

//Insert a new Blank Command which will be set as the Latest Command
function insertCommand() {
  const newCommand = document.createElement("p");
  newCommand.classList.add("command", "current-command");
  newCommand.insertAdjacentHTML(
    "afterbegin",
    `<span class="locator">${locatorPrefix}></span>
      <span class="line" contenteditable spellcheck="false"></span>`
  );
  myConsole.appendChild(newCommand);
  focusCommand();
}

//Populate the Latest Command Line with a Command
function setCommand(command) {
  const currentCommand = document
    .querySelector(".current-command")
    .querySelector(".line");
  currentCommand.innerText = command;
  const range = document.createRange();
  range.selectNodeContents(currentCommand);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

//Focus the Latest Command
function focusCommand() {
  document.querySelector(".current-command").querySelector(".line").focus();
}

//Add Past Command to List
function addCommandList(command) {
  if (pastCommands[lastCommandPos] !== command) {
    pastCommands.push(command);
    lastCommandPos = pastCommands.length;
  }
}

//Get Next Command from CommandList
function getPrevCommand() {
  lastCommandPos = lastCommandPos - 1;
  if (lastCommandPos < 0) lastCommandPos = 0;
  return pastCommands.length ? pastCommands[lastCommandPos] : "";
}

//Get Previous Command from CommandList
function getNextCommand() {
  lastCommandPos = lastCommandPos + 1;
  if (lastCommandPos >= pastCommands.length) {
    lastCommandPos = pastCommands.length;
    return "";
  }
  return pastCommands[lastCommandPos];
}

//Inserts a Blank Line
function insertBlankLine() {
  myConsole.appendChild(document.createElement("br"));
}

//Inserts a Line with given Text
function insertLine(text) {
  const newLine = document.createElement("p");
  newLine.classList.add("output");
  newLine.insertAdjacentHTML("afterbegin", `<span class="line">${text}</span>`);
  myConsole.appendChild(newLine);
}

//Displays Headers at the Top
function displayHeaders() {
  headerLines.forEach((headerLine) => {
    if (headerLine.length == 0) {
      insertBlankLine();
      return;
    }
    const newHeader = document.createElement("p");
    newHeader.classList.add("header");
    newHeader.insertAdjacentHTML(
      "afterbegin",
      `<span class="line" spellcheck="false">${headerLine}</span>`
    );
    myConsole.appendChild(newHeader);
  });
  insertBlankLine();
}

//Display Console Message
function displayConsoleMessages() {
  for (message of consoleMessages) {
    console.log(`%c${message.text}`, message.style);
  }
}
//Listeners
//Load Listener
window.addEventListener("load", () => {
  //Init Methods
  displayHeaders();
  insertCommand();
  focusCommand();
  displayConsoleMessages();
  //Loads Default Volume
  const vol = parseFloat(localStorage.getItem("musicvolume"));
  if (!isNaN(vol) && vol >= 0 && vol <= 1) music.volume = vol;
  //Loads Default Looptype
  const lupType = parseInt(localStorage.getItem("looptype"));
  if (!isNaN(lupType) && lupType >= 0 && lupType <= 2) loop(lupType);
  //Loads All Playlists
  const lists = localStorage.getItem("playlists");
  try {
    playlists = JSON.parse(lists);
  } catch (e) {
    //Ignore Data
  }
});

//Command Keypress Listeners
document.body.addEventListener("keydown", (e) => {
  //Enter
  if (e.code === "Enter") {
    e.preventDefault();
    run();
  }

  //Up
  if (e.code === "ArrowUp") {
    e.preventDefault();
    const command = getPrevCommand();
    setCommand(command);
  }

  //Down
  if (e.code === "ArrowDown") {
    e.preventDefault();
    const command = getNextCommand();
    setCommand(command);
  }
});

//Music Error Listener
music.addEventListener("error", () => {
  insertLine("Music Error Code: " + music.error.code);
});

//Music End Listener
music.addEventListener("ended", () => {
  playNext();
});
