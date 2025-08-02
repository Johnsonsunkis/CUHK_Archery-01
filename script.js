// Declare global variables for overall state.
let currentEnd = 0;
let currentArrow = 0;
let endScores = [];
let scoresPerEnd = 3; // Default, will change based on distance
let totalEnds = 10; // Default, will change based on distance
let totalCumulativeScore = 0; // Global variable to store the final cumulative score

let goodShots = 0;
let badShots = 0;

// Global variables for the countdown timer
let timer; // Holds the setInterval object
let timeLeft = 180; // Default time in seconds (3 minutes)
let isPaused = true;

// Function to show a specific page and hide others
function showPage(pageToShow) {
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(page => page.classList.remove('active'));
    pageToShow.classList.add('active');
}

// Function to create/reset the scoreboard HTML table
function createScoreboard(arrowsPerEnd, numEnds) {
    scoresPerEnd = arrowsPerEnd;
    totalEnds = numEnds;
    endScores = Array(totalEnds).fill(0).map(() => Array(scoresPerEnd).fill(null)); // Initialize with nulls
    totalCumulativeScore = 0; // Reset cumulative score for new practice

    const scoreSheetTable = document.getElementById('scoreSheetTable');
    scoreSheetTable.innerHTML = ''; // Clear previous table content

    let headerRow = '<tr><th>End</th>';
    for (let i = 1; i <= scoresPerEnd; i++) {
        headerRow += `<th>A${i}</th>`;
    }
    headerRow += '<th>End Total</th><th>Cumulative</th></tr>';
    scoreSheetTable.innerHTML += headerRow;

    for (let i = 0; i < totalEnds; i++) {
        let row = `<tr id="endRow-${i}"><td>${i + 1}</td>`;
        for (let j = 0; j < scoresPerEnd; j++) {
            row += `<td id="scoreCell-${i}-${j}">-</td>`;
        }
        row += `<td id="endTotal-${i}">0</td><td id="cumulativeTotal-${i}">0</td></tr>`;
        scoreSheetTable.innerHTML += row;
    }

    currentEnd = 0;
    currentArrow = 0;
    updateScoreboardUI(); // Initial update of UI after board creation
    updateCurrentShotCounter(); // Initial update of shot counter
}

// Function to update the scoreboard display in the UI
function updateScoreboardUI() {
    let currentRunningCumulative = 0; // Local variable to calculate running cumulative for display
    for (let i = 0; i < totalEnds; i++) {
        let endTotal = 0;
        for (let j = 0; j < scoresPerEnd; j++) {
            const score = endScores[i][j];
            const cell = document.getElementById(`scoreCell-${i}-${j}`);
            if (cell) {
                // Clear any existing color classes
                cell.className = '';

                // Display the score as-is, whether it's a number or a string like 'X'
                if (score !== null) {
                    cell.textContent = score;

                    // Apply color class based on score
                    if (score === 'X' || score === '10*') {
                        cell.classList.add('score-cell-X');
                    } else if (score >= 9) {
                        cell.classList.add('score-cell-10');
                    } else if (score >= 7) {
                        cell.classList.add('score-cell-8');
                    } else if (score >= 5) {
                        cell.classList.add('score-cell-6');
                    } else if (score >= 3) {
                        cell.classList.add('score-cell-4');
                    } else if (score >= 1) {
                        cell.classList.add('score-cell-2');
                    } else { // Score is 0 or 'M'
                        cell.classList.add('score-cell-0');
                    }
                } else {
                    cell.textContent = '-';
                }

                // Check if the score is a number before adding to the total
                if (typeof score === 'number') {
                    endTotal += score;
                } else if (score === 'X' || score === '10*') {
                    endTotal += 10;
                }
            }
        }
        const endTotalCell = document.getElementById(`endTotal-${i}`);
        if (endTotalCell) {
            endTotalCell.textContent = endTotal;
        }

        currentRunningCumulative += endTotal;
        const cumulativeCell = document.getElementById(`cumulativeTotal-${i}`);
        if (cumulativeCell) {
            cumulativeCell.textContent = currentRunningCumulative;
        }
    }
    totalCumulativeScore = currentRunningCumulative;

    // Highlight current end
    document.querySelectorAll('#scoreSheetTable tr').forEach(row => row.style.backgroundColor = '');
    const currentRow = document.getElementById(`endRow-${currentEnd}`);
    if (currentRow) {
        currentRow.style.backgroundColor = '#e0f7fa';
    }
}

// Function to record a score when a score button is clicked
window.recordScore = function(score) {
    if (currentEnd >= totalEnds) {
        // We've completed all ends, just return.
        return;
    }
    if (currentArrow >= scoresPerEnd) {
        // End is full, just return.
        return;
    }

    // Check if the score is a number or a string (X, 10*)
    let scoreValue = 0;
    if (typeof score === 'string') {
        // Special scores like 'X' and '10*' still count as 10 points
        scoreValue = 10;
        // Store the original string for display
        endScores[currentEnd][currentArrow] = score;
    } else {
        scoreValue = score;
        endScores[currentEnd][currentArrow] = score;
    }

    currentArrow++;
    updateScoreboardUI(); // Update scoreboard immediately after recording score
    updateCurrentShotCounter(); // Update shot counter immediately

    // Auto-advance to next end if current end is full
    if (currentArrow >= scoresPerEnd && currentEnd < totalEnds - 1) {
        currentEnd++;
        currentArrow = 0;
        updateCurrentShotCounter(); // Update counter for new end
        updateScoreboardUI(); // Update UI to highlight new end
    } else if (currentArrow >= scoresPerEnd && currentEnd === totalEnds - 1) {
        updateCurrentShotCounter(); // Update counter to show completion
    }
};


// Function to update the current shot counter display
function updateCurrentShotCounter() {
    const currentShotCounterSpan = document.getElementById('currentShotCounter');
    if (currentShotCounterSpan) {
        if (currentEnd >= totalEnds) {
            currentShotCounterSpan.textContent = `Practice Completed!`;
        } else {
            currentShotCounterSpan.textContent = `End: ${currentEnd + 1}, Arrow: ${currentArrow + 1}`;
        }
    }
}

// Function to save the practice record
async function savePracticeRecord() {
    const archerName = document.getElementById('archerName').value;
    const practiceDate = document.getElementById('practiceDate').value;
    const practiceDistance = document.getElementById('practiceDistance').value;
    const notes = document.getElementById('practiceNotes').value;
    const equipment = document.getElementById('equipmentUsed').value;

    const record = {
        archerName: archerName,
        date: practiceDate,
        distance: practiceDistance,
        scores: endScores,
        totalScore: totalCumulativeScore,
        goodShots: goodShots,
        badShots: badShots,
        notes: notes,
        equipment: equipment,
        timestamp: new Date().toISOString()
    };

    // Retrieve existing records from local storage or initialize a new array
    const existingRecords = JSON.parse(localStorage.getItem('archeryRecords')) || [];
    existingRecords.push(record);
    localStorage.setItem('archeryRecords', JSON.stringify(existingRecords));

    console.log("Saving record:", record);
    alert('Practice saved successfully!');

    // Reset forms and state after saving
    document.getElementById('archerName').value = '';
    document.getElementById('practiceDate').value = '';
    document.getElementById('practiceDistance').value = '';
    document.getElementById('practiceNotes').value = '';
    document.getElementById('equipmentUsed').value = '';
    goodShots = 0;
    badShots = 0;
    document.getElementById('goodShotCount').textContent = 0;
    document.getElementById('badShotCount').textContent = 0;
    createScoreboard(3, 10);
    showPage(archerInfoPage);
}

// Helper function to format the scores for display
function formatScores(scoresArray) {
    return scoresArray.map(end => {
        const endScores = end.map(score => score !== null ? score : '-');
        return `[${endScores.join(', ')}]`;
    }).join(' ');
}

// Function to display the practice history from local storage
function displayPracticeHistory() {
    const historyListDiv = document.getElementById('historyList');
    historyListDiv.innerHTML = ''; // Clear previous content

    const records = JSON.parse(localStorage.getItem('archeryRecords')) || [];

    if (records.length === 0) {
        historyListDiv.innerHTML = '<p>No practice history found.</p>';
        return;
    }

    // Create a table to display the history
    const historyTable = document.createElement('table');
    historyTable.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Distance</th>
                <th>Total Score</th>
                <th>Scores per End</th>
                <th>Notes</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    const tbody = historyTable.querySelector('tbody');

    records.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.distance}m</td>
            <td>${record.totalScore}</td>
            <td>${formatScores(record.scores)}</td>
            <td>${record.notes || 'No notes'}</td>
            <td><button onclick="deleteRecord(${index})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });

    historyListDiv.appendChild(historyTable);
}

// Function to delete a specific record by its index
window.deleteRecord = function(index) {
    if (confirm('Are you sure you want to delete this practice record? This action cannot be undone.')) {
        const records = JSON.parse(localStorage.getItem('archeryRecords')) || [];
        records.splice(index, 1); // Remove the record at the specified index
        localStorage.setItem('archeryRecords', JSON.stringify(records));
        displayPracticeHistory(); // Refresh the list
        alert('Record deleted successfully!');
    }
};

// --- Countdown timer functions ---
function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    const secondsOnlyCheckbox = document.getElementById('secondsOnlyCheckbox');

    // Remove previous color classes
    timerDisplay.classList.remove('timer-running', 'timer-warning');

    // Add new color class based on time left
    if (timeLeft <= 30) {
        timerDisplay.classList.add('timer-warning');
    } else {
        timerDisplay.classList.add('timer-running');
    }
    
    // Update display text based on checkbox
    if (secondsOnlyCheckbox && secondsOnlyCheckbox.checked) {
        timerDisplay.textContent = timeLeft;
    } else {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

function startTimer() {
    if (isPaused && timeLeft > 0) {
        isPaused = false;
        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timer);
                isPaused = true;
                alert("Time's up!");
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (!isPaused) {
        isPaused = true;
        clearInterval(timer);
    }
}

function resetTimer() {
    pauseTimer();
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    const newTime = minutes * 60 + seconds;
    
    // Set the new time. If the new time is invalid, default to 3 minutes.
    timeLeft = newTime > 0 ? newTime : 180;
    
    updateTimerDisplay();
}

// --- All DOM-related interactions go inside DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    // Get references to all pages
    const archerInfoPage = document.getElementById('archerInfoPage');
    const scoreSheetPage = document.getElementById('scoreSheetPage');
    const shotCounterPage = document.getElementById('shotCounterPage');
    const notesPage = document.getElementById('notesPage');
    const historyPage = document.getElementById('historyPage');
    const countdownPage = document.getElementById('countdownPage');

    // Get references to buttons on Archer Info Page
    const startScoringBtn = document.getElementById('startScoring');
    const goToShotCounterBtn = document.getElementById('goToShotCounter');
    const goToNotesBtn = document.getElementById('goToNotes');
    const goToHistoryBtn = document.getElementById('goToHistory');
    const goToCountdownBtn = document.getElementById('goToCountdown');

    // Get references to navigation buttons from Score Sheet Page
    const navToArcherInfo1 = document.getElementById('navToArcherInfo1');
    const navToShotCounterFromScore = document.getElementById('navToShotCounterFromScore');
    const navToNotesFromScore = document.getElementById('navToNotesFromScore');

    // Get references to navigation buttons from Shot Counter Page
    const navToArcherInfo2 = document.getElementById('navToArcherInfo2');
    const navToScoreSheetFromShot = document.getElementById('navToScoreSheetFromShot');
    const navToNotesFromShot = document.getElementById('navToNotesFromShot');

    // Get references to navigation buttons from Notes Page
    const navToArcherInfo3 = document.getElementById('navToArcherInfo3');
    const navToScoreSheetFromNotes = document.getElementById('navToScoreSheetFromNotes');
    const navToShotCounterFromNotes = document.getElementById('navToShotCounterFromNotes');

    // Get references to navigation buttons from History Page
    const navToArcherInfo4 = document.getElementById('navToArcherInfo4');

    // Get references to navigation buttons from Countdown Page
    const navToArcherInfo5 = document.getElementById('navToArcherInfo5');

    // Get references to Shot Counter buttons
    const goodShotBtn = document.getElementById('goodShotBtn');
    const badShotBtn = document.getElementById('badShotBtn');
    const goodShotCount = document.getElementById('goodShotCount');
    const badShotCount = document.getElementById('badShotCount');

    // Get references to Save buttons
    const endPracticeBtn = document.getElementById('endPractice');
    const saveRecordBtn = document.getElementById('saveRecord');
    const saveRecordNotesBtn = document.getElementById('saveRecordNotes');

    // Get references to countdown timer buttons and inputs
    const timerDisplay = document.getElementById('timerDisplay');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const pauseTimerBtn = document.getElementById('pauseTimerBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    const minutesInput = document.getElementById('minutesInput');
    const secondsInput = document.getElementById('secondsInput');
    const setTimerBtn = document.getElementById('setTimerBtn');
    const secondsOnlyCheckbox = document.getElementById('secondsOnlyCheckbox');


    // --- Initial Page Load ---
    showPage(archerInfoPage); // Start on the archer info page

    // --- Event Listeners for Archer Info Page Buttons ---
    startScoringBtn.addEventListener('click', () => {
        const archerName = document.getElementById('archerName').value;
        const practiceDate = document.getElementById('practiceDate').value;
        const practiceDistanceValue = document.getElementById('practiceDistance').value;

        // Basic validation: Check if all fields are filled.
        if (!archerName || !practiceDate || !practiceDistanceValue) {
            alert('Please fill in all practice details (Name, Date, and Distance)!');
            return; // Exit the function if validation fails.
        }
        
        // Parse the distance value as an integer.
        const practiceDistance = parseInt(practiceDistanceValue, 10);

        // Logic to determine arrows per end based on distance.
        if (practiceDistance <= 30) {
            createScoreboard(3, 10); // Indoor: 3 arrows per end, 10 ends
        } else {
            createScoreboard(6, 6); // Outdoor: 6 arrows per end, 6 ends
        }
        
        showPage(scoreSheetPage);
    });

    goToShotCounterBtn.addEventListener('click', () => {
        showPage(shotCounterPage);
    });

    goToNotesBtn.addEventListener('click', () => {
        showPage(notesPage);
    });

    goToHistoryBtn.addEventListener('click', () => {
        showPage(historyPage);
        displayPracticeHistory();
    });

    goToCountdownBtn.addEventListener('click', () => {
        showPage(countdownPage);
        updateTimerDisplay();
    });

    // --- Event Listeners for Score Sheet Page Buttons ---
    if (navToArcherInfo1) {
        navToArcherInfo1.addEventListener('click', () => showPage(archerInfoPage));
    }
    if (navToShotCounterFromScore) {
        navToShotCounterFromScore.addEventListener('click', () => showPage(shotCounterPage));
    }
    if (navToNotesFromScore) {
        navToNotesFromScore.addEventListener('click', () => showPage(notesPage));
    }
    if (endPracticeBtn) {
        endPracticeBtn.addEventListener('click', savePracticeRecord);
    }

    // --- Event Listeners for Shot Counter Page Buttons ---
    if (goodShotBtn) {
        goodShotBtn.addEventListener('click', () => {
            goodShots++;
            goodShotCount.textContent = goodShots;
        });
    }
    if (badShotBtn) {
        badShotBtn.addEventListener('click', () => {
            badShots++;
            badShotCount.textContent = badShots;
        });
    }
    if (navToArcherInfo2) {
        navToArcherInfo2.addEventListener('click', () => showPage(archerInfoPage));
    }
    if (navToScoreSheetFromShot) {
        navToScoreSheetFromShot.addEventListener('click', () => showPage(scoreSheetPage));
    }
    if (navToNotesFromShot) {
        navToNotesFromShot.addEventListener('click', () => showPage(notesPage));
    }
    if (saveRecordBtn) {
        saveRecordBtn.addEventListener('click', savePracticeRecord);
    }

    // --- Event Listeners for Notes Page Buttons ---
    if (navToArcherInfo3) {
        navToArcherInfo3.addEventListener('click', () => showPage(archerInfoPage));
    }
    if (navToScoreSheetFromNotes) {
        navToScoreSheetFromNotes.addEventListener('click', () => showPage(scoreSheetPage));
    }
    if (navToShotCounterFromNotes) {
        navToShotCounterFromNotes.addEventListener('click', () => showPage(shotCounterPage));
    }
    if (saveRecordNotesBtn) {
        saveRecordNotesBtn.addEventListener('click', savePracticeRecord);
    }

    // --- Event Listeners for History Page Buttons ---
    if (navToArcherInfo4) {
        navToArcherInfo4.addEventListener('click', () => showPage(archerInfoPage));
    }

    // --- Event Listeners for Countdown Page Buttons ---
    if (navToArcherInfo5) {
        navToArcherInfo5.addEventListener('click', () => showPage(archerInfoPage));
    }
    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', startTimer);
    }
    if (pauseTimerBtn) {
        pauseTimerBtn.addEventListener('click', pauseTimer);
    }
    if (resetTimerBtn) {
        resetTimerBtn.addEventListener('click', resetTimer);
    }
    if (setTimerBtn) {
        setTimerBtn.addEventListener('click', resetTimer);
    }
    // Add event listener to update display when checkbox is toggled
    if (secondsOnlyCheckbox) {
        secondsOnlyCheckbox.addEventListener('change', updateTimerDisplay);
    }
}); // End of DOMContentLoaded