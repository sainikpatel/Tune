console.log("Script loaded successfully");

let currentSong = new Audio();
let songs;
let currFolder;
let currentSongIndex = 0; 


const pages = document.querySelectorAll('.page');
function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    return songs;
}

const cleanName = (name) => {
    let clean = name.replaceAll("%20", " ").replaceAll("%2B", " ").replaceAll("%", "").replace(".mp3", "");
    if (clean.includes("(")) {
        clean = clean.split("(")[0].trim();
    }
    return clean;
};


async function displayAlbums() {
    const cardContainer = document.querySelector(".cardcontainer");
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    cardContainer.innerHTML = "";
    for (let anchor of anchors) {
        if (anchor.href.includes("/songs/") && !anchor.href.includes(".htaccess")) {
            let folderName = anchor.href.split("/").slice(-2)[0];
            if (folderName !== "songs") {
                cardContainer.innerHTML += `
                    <div data-folder="songs/${folderName}" class="card">
                        <img src="/songs/${folderName}/cover.jpg" alt="${folderName}">
                        <h2>${folderName.charAt(0).toUpperCase() + folderName.slice(1)}</h2>
                    </div>`;
            }
        }
    }
}

function displaySongList() {
    const songUL = document.querySelector("#playlist-page .songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li data-track="${song}">${cleanName(song)}</li>`;
    }
    document.getElementById('playlist-title').textContent = currFolder.split('/').pop();
}

const playMusic = (track, pause = false) => {


    currentSongIndex = songs.indexOf(track);
    if (currentSongIndex === -1) {
        console.error("Track not found in playlist:", track);

    }
    
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById('playbtn').src = "pause.svg";
    }
    document.getElementById('playbar').classList.add('visible');
    
    updatePlayerUI(track);
};

function updatePlayerUI(track) {
    const trackName = cleanName(track);
    const folderName = currFolder.split('/').pop();
    const artworkSrc = `/${currFolder}/cover.jpg`;


    document.querySelector("#playbar .songinfo").textContent = trackName;
    document.getElementById('playbar-artwork').src = artworkSrc;


    document.getElementById('fs-songinfo').textContent = trackName;
    document.getElementById('fs-artist').textContent = folderName;
    document.getElementById('fs-artwork').src = artworkSrc;
    document.querySelector('.fs-background-art').style.backgroundImage = `url('${artworkSrc}')`;


    let allSongs = document.querySelectorAll("#playlist-page .songList li");
    allSongs.forEach(song => song.classList.remove("active-song"));
    let currentSongLi = document.querySelector(`#playlist-page .songList li[data-track="${track}"]`);
    if (currentSongLi) currentSongLi.classList.add("active-song");
}


async function main() {
    await displayAlbums();


    document.getElementById('enter-btn').addEventListener('click', () => showPage('browser-page'));
    document.querySelector('.back-btn').addEventListener('click', () => showPage('browser-page'));

    document.querySelector(".cardcontainer").addEventListener("click", async (e) => {
        const card = e.target.closest('.card');
        if (card) {
            await getSongs(card.dataset.folder);
            displaySongList();
            showPage('playlist-page');
        }
    });

    document.querySelector("#playlist-page .songList ul").addEventListener("click", (e) => {
        const li = e.target.closest('li');
        if (li) playMusic(li.dataset.track);
    });
    
    playbtn.addEventListener("click", () => {
        if (!currentSong.src) return;
        if (currentSong.paused) {
            currentSong.play();
            playbtn.src = "pause.svg";
        } else {
            currentSong.pause();
            playbtn.src = "play-button.svg";
        }
    });



    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            let currentTime = currentSong.currentTime;
            let duration = currentSong.duration;
            const formatTime = (seconds) => {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = Math.floor(seconds % 60);
                return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
            };
            
            document.querySelector("#playbar .songtime").innerHTML = `${formatTime(currentTime)} / ${formatTime(duration)}`;
            document.querySelector("#playbar .circle").style.left = (currentTime / duration) * 100 + "%";
        }
    });

    document.querySelector("#playbar .seekbar").addEventListener("click", (e) => {
        if (!isNaN(currentSong.duration)) {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width);
            currentSong.currentTime = currentSong.duration * percent;
        }
    });

    previous.addEventListener("click", () => {
        if (currentSongIndex - 1 >= 0) {
            playMusic(songs[currentSongIndex - 1]);
        }
    });

    next.addEventListener("click", () => {
        if (currentSongIndex + 1 < songs.length) {
            playMusic(songs[currentSongIndex + 1]);
        }
    });
    
    currentSong.addEventListener("ended", () => next.click());
    document.querySelector('.volume-slider').addEventListener('input', (e) => {
        currentSong.volume = e.target.value / 100;
    });
    
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        if (currentSong.src) {
            showPage('fullscreen-player');
        }
    });
    document.getElementById('fs-close-btn').addEventListener('click', () => {
        showPage('playlist-page');
    });
    
}

main();