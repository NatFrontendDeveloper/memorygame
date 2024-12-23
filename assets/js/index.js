'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('memory-game');
    const startButton = document.getElementById('startGame');
    const pairCountSelect = document.getElementById('pairCount');
    const deckSelect = document.getElementById('deckSelect'); 
    const gamesPlayedElems = {};
    const bestTimeElems = {};
    let clickCount = 0; 

    // Befüllen gamesPlayedElems und bestTimeElems Objecte mit Werten von 2 bis 12
    for (let i = 2; i <= 12; i++) {
        gamesPlayedElems[i] = document.getElementById(`gamesPlayed_${i}`);
        bestTimeElems[i] = document.getElementById(`bestTime_${i}`);
    }

    let gamesPlayed = {};
    let bestTimes = {}; 
    for (let i = 2; i <= 12; i++) {
        gamesPlayed[i] = 0;
        bestTimes[i] = null;
    }

    let pairCount = 2;
    let cards = [];
    let startTime;

    // Laden der Statistiken aus dem localStorage
    const loadStats = () => {
        for (let count = 2; count <= 12; count++) {
            const storedGamesPlayed = localStorage.getItem(`gamesPlayed_${count}`);
            const storedBestTime = localStorage.getItem(`bestTime_${count}`);

            if (storedGamesPlayed !== null) {
                gamesPlayed[count] = parseInt(storedGamesPlayed);
            }

            if (storedBestTime !== null) {
                bestTimes[count] = parseInt(storedBestTime);
            }
        }
    };
 // Initialisierung des Spiels
    // Инициализация игры
    const initializeGame = () => {
        pairCount = parseInt(pairCountSelect.value);
        loadCards();
        clickCount = 0; 
    };
// Karten laden mittels AJAX
    // Загрузка карт через AJAX
    const loadCards = () => {
        const selectedDeck = deckSelect.value; 

        console.log(selectedDeck);
        const xhr = new XMLHttpRequest();

        xhr.open('GET', `/assets/${selectedDeck}.json`, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                cards = createCards(data.cards, pairCount);
                gameContainer.innerHTML = '';
                startTime = Date.now();
                displayCards(cards);
            }
        };
        xhr.send();
    };
// Erstellen der Kartenpaare
    // Создание карт
    const createCards = (allCards, pairCount) => {
        let deck = [];
        for (let i = 0; i < pairCount; i++) {
            const card = allCards[i % allCards.length];
            deck.push({ image: card.image, number: card.number });
            deck.push({ image: card.image, number: card.number });
        }
        return shuffle(deck);
    };
 // Anzeige der Karten
    // Отображение карт
    const displayCards = (cards) => {
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.index = i;
            cardElement.style.backgroundImage = `url('./assets/img/back_${deckSelect.value}.jpg')`; // Путь к рубашке
            gameContainer.appendChild(cardElement);
            cardElement.addEventListener('click', function() {
                flipCard(card, cardElement);
            });
        }
    };

    // Mischen der Karten
    // Перемешивание карт
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    let flippedCards = [];

    // Umdrehen der Karte
    // Переворачивание карты
    const flipCard = (card, cardElement) => {
        if (flippedCards.length < 2 && !flippedCards.includes(cardElement)) {
            cardElement.style.backgroundImage = `url('${card.image}')`; 
            cardElement.textContent = card.number; 
            flippedCards.push(cardElement);
            clickCount++; 
            if (flippedCards.length === 2) {
                checkForMatch();
            }
        }
    };


     // Überprüfen der Kartenpaare
    // Проверка совпадения
    const checkForMatch = () => {
        const card1 = flippedCards[0];
        const card2 = flippedCards[1];
        if (card1.textContent === card2.textContent) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            flippedCards = [];
            checkForWin();
        } else {
            setTimeout(() => {
                card1.style.backgroundImage = `url('./assets/img/back_${deckSelect.value}.jpg')`; // Возвращаем рубашку
                card2.style.backgroundImage = `url('./assets/img/back_${deckSelect.value}.jpg')`;
                card1.textContent = '';
                card2.textContent = '';
                flippedCards = [];
            }, 1000);
        }
    };

    // Überprüfen des Spielgewinns
    // Проверка выигрыша
    const checkForWin = () => {
        if (document.querySelectorAll('.matched').length === cards.length) {
            const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
            gamesPlayed[pairCount]++;
            if (bestTimes[pairCount] === null || timeElapsed < bestTimes[pairCount]) {
                bestTimes[pairCount] = timeElapsed;
                localStorage.setItem(`bestTime_${pairCount}`, bestTimes[pairCount]);
            }
            localStorage.setItem(`gamesPlayed_${pairCount}`, gamesPlayed[pairCount]);
            localStorage.setItem(`clickCount_${pairCount}`, clickCount); 
            updateStats();
            // alert(`Sie haben gewonnen! Zeit: ${timeElapsed} Sekunden, Klicken: ${clickCount}`);


        // Показ модального окна
        const winModal = document.getElementById('winModal');
        const winMessage = document.getElementById('winMessage');
        winMessage.textContent = `Herzlichen Glückwunsch! Du hast das Spiel in ${timeElapsed} Sekunden mit ${clickCount} Klicks abgeschlossen.`;
        winModal.style.display = 'flex'; 
         document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('winModal').style.display = 'none';
    });
        }
    };

// Statistiken anzeigen
    // Обновление статистики
    const updateStats = () => {
        for (let count = 2; count <= 12; count++) {
            gamesPlayedElems[count].textContent = gamesPlayed[count];
            bestTimeElems[count].textContent = bestTimes[count] !== null ? bestTimes[count] : '0';
        }
    };
// Spiel starten
    loadStats(); // Statistiken beim Laden der Seite
    startButton.addEventListener('click', initializeGame);
    updateStats();// Statistikanzeige aktualisieren

});
