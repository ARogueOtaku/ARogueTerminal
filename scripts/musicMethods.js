//Current Queue
let currentQueue = [];
let currentMusic = { videoID: "", title: "" };
let loopType = 1;
let currentQueuePos = 0;
let queuePlaying = false;
let playlists = [];

//Play Music by ID
async function playById(musicObj, videoid, title) {
  let titleRes;
  if (!title) {
    titleRes = await fetch("https://yd-loader.glitch.me/title?v=" + videoid);
    if (titleRes.status === 500) {
      insertLine("No Music found with ID: " + videoid);
      return;
    }
    title = await titleRes.text();
  }
  const url = "https://yd-loader.glitch.me/audio?v=" + videoid + "&q=lowest";
  music.src = url;
  insertLine("Trying to play: " + title + ". Please be Paitent!");
  currentMusic.videoID = videoid;
  currentMusic.title = title;
  await play(musicObj);
}

//Play Music by Search Term
async function playBySearchTerm(musicObj, searchTerm) {
  const songRes = await fetch(
    "https://yd-loader.glitch.me/search?q=" + searchTerm
  );
  let song = await songRes.json();
  if (songRes.status !== 500 && song.items && song.items.length > 0) {
    song = song.items[0];
    await playById(musicObj, song.videoID, song.title);
  } else {
    insertLine("Did not find anything with: " + searchTerm);
  }
}

//Play Music
async function play(musicObj) {
  if (musicObj.src.length === 0) {
    insertLine("No Music Sources defined");
    return;
  }
  try {
    await musicObj.play();
  } catch (err) {
    insertLine("Music Error while Attempting to Play: " + err.message);
    currentMusic.videoID = "";
    currentMusic.title = "";
  }
}

//Pause Music
async function pause(musicObj) {
  musicObj.pause();
}

//Stop Music
async function stop(musicObj) {
  musicObj.pause();
  musicObj.currentTime = 0;
}

//Set Music Volume
function volume(musicObj, vol) {
  try {
    musicObj.volume = vol;
    localStorage.setItem("musicvolume", vol);
  } catch (err) {
    insertLine("Music Error while Attempting to Set Volume: " + err.message);
  }
}

//Set Loop Type
function loop(type = 0) {
  loopType = type;
  localStorage.setItem("looptype", type);
}

//Add to Queue by ID
async function addById(videoid, title) {
  let titleRes;
  if (!title) {
    titleRes = await fetch("https://yd-loader.glitch.me/title?v=" + videoid);
    if (titleRes.status === 500) {
      insertLine("No Music found with ID: " + videoid);
      return;
    }
    title = await titleRes.text();
  }
  currentQueue.push({ videoID: videoid, title });
  insertLine("Added: " + title + " to Current Queue.");
}

//Add to Queue by Search Term
async function addBySearchTerm(searchTerm) {
  const songRes = await fetch(
    "https://yd-loader.glitch.me/search?q=" + searchTerm
  );
  let song = await songRes.json();
  if (songRes.status !== 500 && song.items && song.items.length > 0) {
    song = song.items[0];
    await addById(song.videoID, song.title);
  } else {
    insertLine("Did not find anything with: " + searchTerm);
  }
}

//Show Queue
function showMusicList(list) {
  if (list.length === 0) {
    insertLine("No Songs Found");
    return;
  }
  list.forEach((song, index) => {
    insertLine(
      `${index + 1}. ${song.title} ${
        index === currentQueuePos && queuePlaying ? " - Currently Playing" : ""
      }`
    );
  });
}

//Play Current Queue
async function playQueue(musicObj, pos) {
  if (currentQueue.length === 0) {
    insertLine("No Songs Found in Queue");
    return;
  } else if (!currentQueue[pos]) {
    insertLine("No Songs Found in Queue Postion: " + (pos + 1));
    return;
  }
  await playById(musicObj, currentQueue[pos].videoID, currentQueue[pos].title);
  queuePlaying = true;
  currentQueuePos = pos;
}

//Clear Queue/Playlist
function clearQueue(playlistId = "-cq") {
  if (playlistId === "-cq") {
    currentQueue = [];
    currentQueuePos = 0;
    insertLine("Current Queue Cleared");
    return;
  }
  let removedPlaylist;
  playlists = playlists.filter((playlist) => {
    if (playlist.id === playlistId || playlist.title === playlistId) {
      removedPlaylist = playlist;
      return false;
    }
    return true;
  });
  if (removedPlaylist) {
    insertLine("Playlist: " + playlistId + " removed.");
    localStorage.setItem("playlists", JSON.stringify(playlists));
  }
}

//Move Song Position
//Play Next Music
async function next(musicObj) {
  if (loopType === 0) {
    stop(musicObj);
    await play(musicObj);
    return;
  }
  let nextPos = currentQueuePos;
  if (queuePlaying) {
    nextPos += 1;
    if (loopType === 1 && nextPos > currentQueue.length - 1) nextPos = 0;
    else if (loopType === 2 && nextPos > currentQueue.length - 1) {
      insertLine("Reached End of Queue!");
      return;
    }
  }
  await playQueue(musicObj, nextPos);
}

//Play Previous Music
async function prev(musicObj) {
  if (loopType === 0) {
    stop(musicObj);
    await play(musicObj);
    return;
  }
  let prevPos = currentQueuePos;
  if (queuePlaying) {
    prevPos -= 1;
    if (loopType === 1 && prevPos < 0) prevPos = currentQueue.length - 1;
    else if (loopType === 2 && prevPos < 0) {
      insertLine("Reached End of Queue!");
      return;
    }
  }
  await playQueue(musicObj, prevPos);
}
