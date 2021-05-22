//Init Work
const myConsole = document.getElementById("console");
const currentQueue = [];
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
displayHeaders();
insertCommand();
focusCommand();
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
      if (args[1].length === 0) {
        insertLine("No Video ID found.");
        insertLine("Usage: play [-id|-st] [videoid|searchterm]");
      } else {
        await playById(music, args[1], undefined, currentQueue);
      }
      break;
    case "-st":
      if (args[1].length === 0) {
        insertLine("No Search Term found.");
        insertLine("Usage: play [-id|-st] [videoid|searchterm]");
      } else {
        await playBySearchTerm(music, args[1], currentQueue);
      }
      break;
    case "-h":
      insertLine("Usage: play [-id|-st] [videoid|searchterm]");
      break;
    case undefined:
      await play(music, undefined, undefined, currentQueue);
      break;
    default:
      await playBySearchTerm(music, args[0], currentQueue);
  }
}

//Sets the Audio Volume
function setVolume(...args) {
  const vol = args[0];
  if (vol.length <= 0) {
    insertLine("Usage: volume [0.0 - 1.0]");
    return;
  }
  volume(music, vol);
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
  return pastCommands[lastCommandPos];
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

//Listeners
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
