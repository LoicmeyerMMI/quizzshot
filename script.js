// Définition des sons pour les réponses
const audioGood = new Audio("./assets/audio/good_answer.mp3");
const audioWrong = new Audio("./assets/audio/wrong_answer.mp3");
const audioTimer = new Audio("./assets/audio/timer.mp3");
const audioReady = new Audio("./assets/audio/lets_do_this.mp3");  // Son pour le bouton Ready

// Définition des questions du quiz
const quiz = [
  {
    question: "Who's hit this shot?",
    video: "iw4x.mp4",
    choix: ["FaZe Banks", "FaZe Pussy", "FaZe Fakie", "FaZe Haaper"],
    reponse: "FaZe Haaper"
  },
  {
    question: "Quel est le plus grand pays du monde par superficie ?",
    choix: ["Russie", "Canada", "Chine", "États-Unis"],
    reponse: "Russie"
  },
  {
    question: "Combien de couleurs y a-t-il dans l'arc-en-ciel ?",
    choix: ["5", "6", "7", "8"],
    reponse: "7"
  },
  {
    question: "Quel est le plus grand mammifère terrestre ?",
    choix: ["Éléphant d'Afrique", "Baleine bleue", "Girafe", "Hippopotame"],
    reponse: "Éléphant d'Afrique"
  },
  {
    question: "Quel est le plus haut sommet du monde ?",
    choix: ["Mont Everest", "K2", "Kangchenjunga", "Lhotse"],
    reponse: "Mont Everest"
  }
];

let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft;
let wrongAttempts = 0; // Compteur d'erreurs par question

// Variable indiquant si le son est activé
let soundEnabled = false;

// Gestionnaire pour le bouton "Ready"
document.getElementById('ready-btn').addEventListener('click', () => {
  soundEnabled = true;
  audioReady.play();
  // Masquer le bouton Ready et le texte des règles (si présent)
  document.getElementById('ready-btn-container').style.display = 'none';
  if(document.getElementById('quiz-rules')){
    document.getElementById('quiz-rules').style.display = 'none';
  }
  // Démarrer le quiz
  afficherQuestion();
});

// Fonction de mélange du tableau (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Fonction pour démarrer le timer pour une question (20 secondes pour test, adapter à 120 pour production)
function startTimer() {
  timeLeft = 20;  // Remplacez par 120 pour 2 minutes en production
  const timerDiv = document.getElementById('timer');
  timerDiv.textContent = `Temps restant : ${timeLeft}s`;

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDiv.textContent = `Temps restant : ${timeLeft}s`;

    // Quand il reste 10 secondes, jouer le son du timer si activé
    if (timeLeft === 10 && soundEnabled) {
      audioTimer.play();
    }

    // Si le temps est écoulé, traiter comme erreur
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      // On considère que c'est la deuxième erreur et on affiche le message "Temps écoulé..."
      wrongAttempts = 2;
      traiterReponse(null, null);
    }
  }, 1000);
}

// Fonction pour afficher une question
function afficherQuestion() {
  // Réinitialiser le compteur d'erreurs pour cette question
  wrongAttempts = 0;

  // Masquer le bouton "Valider la réponse" (non utilisé ici)
  document.getElementById('submit-btn').style.display = 'none';

  // Démarrer le timer pour la question
  startTimer();

  const quizContent = document.getElementById('quiz-content');
  quizContent.innerHTML = '';
  document.getElementById('resultat').innerHTML = '';

  // Si le quiz est terminé
  if (currentQuestionIndex >= quiz.length) {
    quizContent.innerHTML = `<p>Quiz terminé ! Votre score est de ${score} sur ${quiz.length}.</p>`;
    clearInterval(timerInterval);
    document.getElementById('timer').textContent = '';
    return;
  }

  const currentQuestion = quiz[currentQuestionIndex];

  // Affichage de la question (titre)
  const questionElement = document.createElement('div');
  questionElement.classList.add('question');
  questionElement.textContent = currentQuestion.question;
  questionElement.style.fontSize = "1.5em"; // taille réduite
  questionElement.style.textAlign = "center";
  questionElement.style.marginBottom = "20px";
  quizContent.appendChild(questionElement);

  // Affichage de la vidéo si présente
  if (currentQuestion.video) {
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('video-container');

    const videoElement = document.createElement('video');
    videoElement.src = `assets/video/${currentQuestion.video}`;
    videoElement.id = 'video-player';
    videoElement.autoplay = true;
    videoElement.muted = true; // démarre muette, activable via Ready
    videoElement.playsInline = true;
    videoElement.loop = true;
    videoElement.style.maxWidth = '100%';
    videoElement.style.display = 'block';
    videoElement.style.margin = '0 auto';

    videoContainer.appendChild(videoElement);

    // Conteneur pour les boutons de contrôle vidéo
    const controlContainer = document.createElement('div');
    controlContainer.style.display = 'flex';
    controlContainer.style.justifyContent = 'center';
    controlContainer.style.alignItems = 'center';
    controlContainer.style.gap = '10px';
    controlContainer.style.marginTop = '10px';

    // Bouton Play/Pause
    const controlBtn = document.createElement('button');
    controlBtn.id = 'control-btn';
    controlBtn.textContent = "❚❚";
    controlBtn.style.fontSize = '1.5em';
    controlBtn.addEventListener('click', () => {
      if (videoElement.paused) {
        videoElement.play();
        controlBtn.textContent = "❚❚";
      } else {
        videoElement.pause();
        controlBtn.textContent = "►";
      }
    });
    controlContainer.appendChild(controlBtn);

    // Bouton Mute/Unmute
    const muteBtn = document.createElement('button');
    muteBtn.id = 'mute-btn';
    muteBtn.textContent = soundEnabled ? "🔇" : "🔊";
    muteBtn.style.fontSize = '1.5em';
    muteBtn.addEventListener('click', () => {
      if (videoElement.muted) {
        videoElement.muted = false;
        muteBtn.textContent = "🔇";
      } else {
        videoElement.muted = true;
        muteBtn.textContent = "🔊";
      }
    });
    controlContainer.appendChild(muteBtn);

    videoContainer.appendChild(controlContainer);
    quizContent.appendChild(videoContainer);

    videoElement.play().catch(error => {
      console.error("La lecture automatique de la vidéo a échoué :", error);
    });
  }

  // Créer un conteneur pour afficher les choix en deux colonnes
  const choicesContainer = document.createElement('div');
  choicesContainer.id = "choices-container";
  choicesContainer.style.display = 'grid';
  choicesContainer.style.gridTemplateColumns = '1fr 1fr';
  choicesContainer.style.gap = '10px';

  // Mélanger et afficher les choix
  const shuffledChoices = shuffle([...currentQuestion.choix]);
  shuffledChoices.forEach((choix, index) => {
    const choixDiv = document.createElement('div');
    choixDiv.classList.add('choix');
    choixDiv.textContent = choix;
    choixDiv.style.cursor = "pointer";
    // Lorsque l'utilisateur clique sur un choix, on valide directement
    choixDiv.addEventListener('click', () => {
      // Si ce n'est pas encore la deuxième erreur, traiter la réponse
      traiterReponse(choix, choixDiv);
    });
    choicesContainer.appendChild(choixDiv);
  });
  quizContent.appendChild(choicesContainer);
}

// Fonction pour traiter la réponse (quand le timer expire ou lors du clic)
function traiterReponse(userAnswer, selectedElement) {
  clearInterval(timerInterval);
  // Mettre à jour l'affichage du timer à 0s
  document.getElementById('timer').textContent = `Temps restant : 0s`;

  const currentQuestion = quiz[currentQuestionIndex];
  const resultatDiv = document.getElementById('resultat');
  resultatDiv.innerHTML = '';

  // Incrémente wrongAttempts si aucune réponse n'est donnée ou la réponse est incorrecte
  if (userAnswer === null || userAnswer !== currentQuestion.reponse) {
    wrongAttempts++;
  }

  // Si la réponse est correcte
  if (userAnswer === currentQuestion.reponse) {
    score++;
    resultatDiv.textContent = "Bonne réponse !";
    resultatDiv.style.color = "green";
    resultatDiv.classList.add('pop');

    if (selectedElement) {
      selectedElement.style.color = "green";
    }
    // Désactiver les clics sur les choix
    const choicesContainer = document.getElementById('choices-container');
    if (choicesContainer) choicesContainer.style.pointerEvents = 'none';
    if (soundEnabled) {
      audioTimer.pause();
      audioTimer.currentTime = 0;
      audioGood.play();
    }
    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Question suivante";
    nextBtn.classList.add('submit-btn', 'next-btn');
    nextBtn.style.display = 'block';
    nextBtn.style.margin = '20px auto';
    nextBtn.style.fontSize = "0.8em";
    nextBtn.style.padding = "5px 10px";
    nextBtn.addEventListener('click', () => {
      currentQuestionIndex++;
      afficherQuestion();
      resultatDiv.textContent = "";
    });
    resultatDiv.appendChild(nextBtn);

    setTimeout(() => {
      resultatDiv.classList.remove('pop');
    }, 500);
  }
  // Si c'est la deuxième erreur ou si le temps est écoulé (réponse définitivement incorrecte)
  else if (wrongAttempts >= 2) {
    resultatDiv.textContent = `Perdu ! Ma bonne réponse était : ${currentQuestion.reponse}`;
    resultatDiv.style.color = "red";
    resultatDiv.classList.add('pop');
    const choicesContainer = document.getElementById('choices-container');
    if (choicesContainer) {
      choicesContainer.style.pointerEvents = 'none';
      Array.from(choicesContainer.children).forEach(child => {
        if (child.textContent.trim() === currentQuestion.reponse) {
          child.style.color = "green";
        } else {
          child.style.color = "red";
        }
      });
    }
    if (soundEnabled) {
      audioTimer.pause();
      audioTimer.currentTime = 0;
      audioWrong.play();
    }
    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Question suivante";
    nextBtn.classList.add('submit-btn', 'next-btn');
    nextBtn.style.display = 'block';
    nextBtn.style.margin = '20px auto';
    nextBtn.style.fontSize = "0.8em";
    nextBtn.style.padding = "5px 10px";
    nextBtn.addEventListener('click', () => {
      currentQuestionIndex++;
      afficherQuestion();
      resultatDiv.textContent = "";
    });
    resultatDiv.appendChild(nextBtn);

    setTimeout(() => {
      resultatDiv.classList.remove('pop');
    }, 500);
  }
  // Première erreur
  else {
    resultatDiv.textContent = "FAUX";
    resultatDiv.style.color = "red";
    resultatDiv.classList.add('pop');
    if (selectedElement) {
      selectedElement.style.color = "red";
    }
    if (soundEnabled) {
      audioWrong.play();
    }
    setTimeout(() => {
      resultatDiv.classList.remove('pop');
      // Redémarrer le timer pour donner une nouvelle chance
      startTimer();
    }, 500);
  }
}

// Fonction appelée dès qu'un choix est cliqué
function verifierReponse() {
  traiterReponse(null);
}

