function init(){
  changeThemeBtn.addEventListener('input', changeTheme);
  searchInputBtn.addEventListener('click', findWord);
  searchForm.addEventListener('submit', findWord);
  searchInput.addEventListener('input', () => {
    searchInput.value = searchInput.value.replace(/[^a-zA-Z]/g, "");
  })
  checkLocalStorage();
}

function checkLocalStorage(){
    const theme = localStorage.getItem('theme');
    if(theme){
      if(theme === 'darkMode'){
        document.body.classList = 'dark-mode';
        changeThemeBtn.setAttribute('checked', '');
      }
    } else{
      if(window.matchMedia(('(prefers-color-scheme : dark)')).matches){
        document.body.classList = 'dark-mode';
        changeThemeBtn.setAttribute('checked', '');
      }
    }
    const font = localStorage.getItem('font');
    if(font){
      if(font === 'serif'){
        document.body.classList.add('serif');
        fontFamilyTxt.innerText = 'Serif';
      } else if(font === 'sansSerif'){
        document.body.classList.add('sans-serif');
        fontFamilyTxt.innerText = 'Sans Serif';
      } else{
        fontFamilyTxt.innerText = 'Mono';
      }
    }
}

function changeTheme(){
  document.body.classList.toggle('dark-mode');
  if(document.body.classList.contains('dark-mode')){
    localStorage.setItem('theme', 'darkMode');
  } else{
    localStorage.setItem('theme', 'lightMode');
  }
}

const fontFamilySelectionBtnContainer = document.querySelector('.font-family');
fontFamilySelectionBtnContainer.addEventListener('click', showFonts);

function showFonts(){
  fontFamilySelectionBtnContainer.classList.toggle('selection');
  const fontFamilySelectionBtns = document.querySelectorAll('.font-family-btn');
  for (const fontFamilySelectionBtn of fontFamilySelectionBtns) {
    fontFamilySelectionBtn.addEventListener('click', changeFontFamily);
  }
}

function changeFontFamily(){
  if(document.body.classList.contains('dark-mode')){
    document.body.classList = 'dark-mode';
  } else{
    document.body.classList = '';
  }
  if(this.innerText === 'Sans Serif'){
    document.body.classList.add('sans-serif');
    fontFamilyTxt.innerText = 'Sans Serif';
    localStorage.setItem('font', 'sansSerif');
  } else if(this.innerText === 'Serif'){
    document.body.classList.add('serif');
    fontFamilyTxt.innerText = 'Serif';
    localStorage.setItem('font', 'serif');
  } else{
    fontFamilyTxt.innerText = 'Mono';
    localStorage.setItem('font', 'mono');
  }
}

async function fetchWords() {
  const inputValue = searchInput.value.trim().toLowerCase();
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${inputValue}`);
  const data = await response.json();
  return data;
}

async function findWord(e) {
  if(e && e.preventDefault)e.preventDefault();
  const searchInputContainer = document.querySelector('.search-input');
  try {
    const datas = await fetchWords();
    const inputValue = searchInput.value.trim().toLowerCase();
    for (const data of datas) {
      if(data.word === inputValue){
        container.innerHTML = `
          <section class="word-container">
          <div class="word-container__wrapper">
            <p class="word">${data.word}</p>
            <p id="phoneticTranscription" class="phonetic-transcription"></p>
          </div>
          <span id="audioBtn"><i class="fa-solid fa-play"></i></span>
        </section>
        <section class="noun" id="noun">
          <div class="noun-header">
            <p>noun</p>
            <div class="border"></div>
          </div>
          <div class="noun-meaning-container">
            <p>Meaning</p>
            <ul id="nounMeaningList">
            </ul>
          </div>
          <div class="synonyms" id="nounSynonymsList">
            <p>Synonyms</p>
            <ul id="synonymsContainer"></ul>
          </div>
        </section>
        <section class="verb" id="verb">
          <div class="verb-header">
            <p>verb</p>
            <div class="border"></div>
          </div>
          <div class="verb-meaning-container">
            <p>Meaning</p>
            <ul id="verbMeaningList">
            </ul>
          </div>
          <div class="synonyms" id="verbSynonymsList">
            <p>Synonyms</p>
            <ul id="verbSynonymsContainer"></ul>
          </div>
        </section>
        <footer>
          <p>Source</p>
          <div id="sourceLinks" class="source-link">
          </div>
        </footer>
        `
        searchInputContainer.classList.remove('error');
      } 
    }
    audioBtn.addEventListener('click', () => {
      audioBtnSound.play();
    });
  } catch {
    const inputValue = searchInput.value.trim().toLowerCase();
    if(inputValue === ''){
      searchInputContainer.classList.add('error');
      container.innerHTML = '';
    } else{
      container.innerHTML = `
          <div class="error-page">
            <img src="assets/images/emoji.png">
            <p>No Definitions Found</p>
            <p>Sorry pal, we couldn't find definitions for the word you were looking for. You can try the search again at later time or head to the web instead.</p>
          </div>
        `
        searchInputContainer.classList.remove('error');
    }
  }
  renderMeanings();
}

async function renderMeanings() {
  try{
    const datas = await fetchWords();
    for (const data of datas) {
      for (const meanings of data.meanings) {
      const synonyms = meanings.synonyms;
        if(meanings.partOfSpeech === 'noun'){
          noun.style.display = 'block';
          if(meanings.definitions.length === 0){
            noun.style.display = 'none';
          }
          for (const definitions of meanings.definitions) {
            if(definitions.example == undefined){
              nounMeaningList.innerHTML += `
                <li><span></span>${definitions.definition}</li>
              `
            } else{
              nounMeaningList.innerHTML += `
                <li><span></span>${definitions.definition}</li>
                <li class="example"><span></span>“${definitions.example}”</li>
              `
            }
          }
          if(synonyms.length !== 0){
            for (let i = 0; i < synonyms.length; i++) {
              const isLast = i === synonyms.length - 1;
              synonymsContainer.innerHTML += `
                <li class="synonyms-txt">${synonyms[i]}${isLast ? '' : ','}</li>
              `
            }
          } else if(synonymsContainer.innerText === ''){
            nounSynonymsList.style.display = 'none';
          } else{
            nounSynonymsList.style.display = 'flex';
          }
        } else if(meanings.partOfSpeech === 'verb'){
          verb.style.display = 'block';
          for (const definitions of meanings.definitions) {
            if(definitions.example == undefined){
              verbMeaningList.innerHTML += `
                <li><span></span>${definitions.definition}</li>
              `
            } else{
              verbMeaningList.innerHTML += `
                <li><span></span>${definitions.definition}</li>
                <li class="example"><span></span>“${definitions.example}”</li>
              `
            }
          }
            for (let i = 0; i < synonyms.length; i++) {
              const isLast = i === synonyms.length - 1;
              verbSynonymsContainer.innerHTML += `
                <li class="synonyms-txt">${synonyms[i]}${isLast ? '' : ','}</li>
              `
            }
           if(verbSynonymsContainer.innerText === ''){
            verbSynonymsList.style.display = 'none';
          } else{
            verbSynonymsList.style.display = 'flex';
          }
        }
        if(nounMeaningList.innerText === ''){
          noun.style.display = 'none';
        }
        if(verbMeaningList.innerText === ''){
          verb.style.display = 'none';
        }
      }
      for (const sources of data.sourceUrls) {
        if (!sourceLinks.innerHTML.includes(`href="${sources}"`)) { 
          sourceLinks.innerHTML += `
            <div class="source-link__wrapper">
              <a href="${sources}" target="_blank">${sources}</a>
              <img src="assets/images/tabler_external-link.svg">
            </div>
          `;
        }
      }
      for (const audios of data.phonetics) {
        if(audios.audio !== ''){
          audioBtn.innerHTML = `
            <audio id="audioBtnSound" src="${audios.audio}"></audio><i class="fa-solid fa-play"></i>
          `
        }
      }
      for (const phonetic of data.phonetics) {
        if('text' in phonetic && phonetic.text !== ''){
          phoneticTranscription.innerText = `${phonetic.text}`;
        } else {
          phoneticTranscription.innerText = '';
        }
      }
    }
    addSynonymClickEvents();
  }
  catch{
    
  }
}

function addSynonymClickEvents() {
  const synonymsLinks = document.querySelectorAll('.synonyms-txt');
  for (const synonym of synonymsLinks) {
    synonym.addEventListener('click', findSynonym);
  }
}

async function findSynonym() {
  const synonymWord = this.innerText.trim().toLowerCase();
  if(synonymWord.includes(',')){
    searchInput.value = synonymWord.slice(0, -1);
  } else{
    searchInput.value = synonymWord;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  fetchWords();
  findWord();
}


init();
