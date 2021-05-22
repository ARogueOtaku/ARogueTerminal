//Play Music by ID
async function playById(musicObj, videoid, title, queue) {
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
  await play(musicObj, videoid, title, queue);
}

//Play Music by Search Term
async function playBySearchTerm(musicObj, searchTerm, queue) {
  const songRes = await fetch(
    "https://yd-loader.glitch.me/search?q=" + searchTerm
  );
  let song = await songRes.json();
  if (songRes.status !== 500 && song.items && song.items.length > 0) {
    song = song.items[0];
    await playById(musicObj, song.videoID, song.title, queue);
  } else {
    insertLine("Did not find anything with: " + searchTerm);
  }
}

//Play Music
async function play(musicObj, videoID, title, queue) {
  if (musicObj.src.length === 0) {
    insertLine("No Music Sources defined");
    return;
  }
  try {
    await musicObj.play();
    let existing = false;
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].videoID === videoID) {
        queue[i].playing = true;
        existing = true;
      } else queue[i].playing = false;
    }
    if (!existing)
      queue.push({
        videoID,
        title,
        playing: true,
      });
  } catch (err) {
    insertLine("Music Error while Attempting to Play: " + err.message);
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
  } catch (err) {
    insertLine("Music Error while Attempting to Set Volume: " + err.message);
  }
}
