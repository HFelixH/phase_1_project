/* Make JS content load (Alternatively, move script to the end of HTML body*/
document.addEventListener("DOMContentLoaded", () => {
    /* Link to JS to CSS & HTML*/
    const squares = document.querySelectorAll(".grid div")
    const scoreDisplay = document.querySelector("span")
    const startButton = document.querySelector(".start")

    const width = 20
    let currentIndex = 0 // Make first div in grid
    let appleIndex = 0 // Make first div in grid
    // Arrary to construct snake [a,b,c]
    // a = Head - start at 2 div on grid
    // b = Body - start at 1 with an increment of 1 as it grows
    // c = Tail - start at 0 and will be the last position of snake
    let currentSnake = [2,1,0] 
    let direction = 1 // Determines snakes position at div 1
    let score = 0
    let speed = 0.8 //Snake movement speed increment
    let intervalTime = 0
    let interval = 0
    let highScoreList = []
    let topScore = [];

    const serverURL = 'http://localhost:3000/hiScoreList'

updateHiScoreBoard()

/* Start/Restart game*/
function startGame() {
    currentSnake.forEach(index => squares[index].classList.remove("snake")) // Remove each/all snake divs
    squares[appleIndex].classList.remove("apple") // Remove Apple in a div
    clearInterval(interval) // Reset all interval
    score = 0 // Reset score to 0
    randomApple()
    direction = 1 // Return snake to start moving right
    scoreDisplay.innerText = score // Show reset score in score display
    intervalTime = 500 // Start speed of snake)
    currentSnake = [2,1,0] // Initial snake body
    currentIndex = 0 // Reset starting position
    currentSnake.forEach(index => squares[index].classList.add("snake")) // Add the initial snake back into the game
    interval = setInterval(playRule, intervalTime) // Implement the game content/rules
    //updateHiScoreBoard()
    //showHiScoreBoard()
}

/* Rules / Content of Snake Game */
function playRule() {
    // Game Over perameters
    if (
        (currentSnake[0] + width >= (width * width) && direction === width) || // If snake touches bottom wall of the grid
        (currentSnake[0] % width === width -1 && direction === 1) || // If snake touches right wall of the grid
        (currentSnake[0] % width === 0 && direction === -1) || // If snake touches left wall of the grid
        (currentSnake[0] - width < 0 && direction === -width) || // If snake touches top wall of the grid
        squares[currentSnake[0] + direction].classList.contains("snake") // If snakes touches it's own body
    ) {
        //gameOver() // Invoke Game Over screen
        return gameOver() // Clear interval if any of the above occurs 
    }

    const tail = currentSnake.pop() // Remove end of the array
    squares[tail].classList.remove("snake") // Removes Snake block
    currentSnake.unshift(currentSnake[0] + direction) // Moves snake forward

    // When snake eats the apple (when snake head div = apple div)
    if (squares[currentSnake[0]].classList.contains("apple")) {
        squares[currentSnake[0]].classList.remove("apple") // Removes apple once it has div contains snake
        squares[tail].classList.add("snake") // Add Snake block into div
        currentSnake.push(tail) // Add snake block to last array (tail)
        randomApple()
        score++
        scoreDisplay.textContent = score
        clearInterval(interval)
        intervalTime = intervalTime * speed
        interval = setInterval(playRule, intervalTime)
    }
    squares[currentSnake[0]].classList.add("snake")
    
    //test to determine postion of snake
    console.log(currentSnake)
    //console.log(width)
    //console.log(direction)

} 

/* Generate new apple in random div once snake has eaten an apple*/
function randomApple() {
    do{
        appleIndex = Math.floor(Math.random() * squares.length)
    } while (squares[appleIndex].classList.contains("snake")) // Ensures that an apple does not appear in div that contains 'snake'
    squares[appleIndex].classList.add("apple")
}

/* Assign function to keycodes to control Snake*/   
function control(e) {
    squares[currentIndex].classList.remove("snake") // Prevent snake to reappear twice

    if(e.keyCode === 39) {
        direction = +1 // move right +1 div upon keypress of 'right arrow'
    } else if (e.keyCode === 38) {
        direction = -width // move up -10 div upon keypress of 'up arrow'
    } else if (e.keyCode === 37) {
        direction = -1 // move left -1 div upon keypress of 'left arrow'
    } else if (e.keyCode === 40) {
        direction = +width // move down +10 div upon keypress of 'down arrow'
    }
}
// EventListener to listen for key presses and click
document.addEventListener('keydown', control)
startButton.addEventListener('click', startGame)

/* Light/Dark mode switch */
const background = document.getElementById('background');
const darkModeSwitch = document.getElementById('darkModeSwitch');
//Dark/Light Mode Switch Function
darkModeSwitch.addEventListener('change', ()=> {
  if (darkModeSwitch.checked) {
    background.className = "darkMode";
  }
  else{
    background.className = "lightMode";
  }
});

/* Game Over Screen*/
function gameOver() {
    clearInterval(interval)
    getScore()
    console.log("Stop")
}

function getScore() {
    let player = prompt("Game Over!! \nPlease enter your name:", "Enter Name"); // Use prompt to notify Game Over and allow player to enter Name
    console.log(player)
    const currentScore ={ // Create arry to include player name and score
    id: Date.now(),
    player: player,
    score: score,
};
highScoreList.push(currentScore); // push New player and score into High Score list
console.log(highScoreList);

saveHighScore(highScoreList)
updateHiScoreBoard()

}

/* Update Highscore */
// Save score to server
function saveHighScore () {
    fetch (serverURL, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(highScoreList)
    }).then(res => res.json)
    .then(json => {
        console.log('Saved high score', highScoreList)
        console.log(json)
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Get score from server and sort to top 5
function updateHiScoreBoard() {
    // const hiScoreBoardList = {
    //     id: Date.now(),
    //     player: player,
    //     score: score,
    // }

    fetch (serverURL)
    .then(res => res.json())
    .then (json => {
        console.log(json)
    });

    showHiScoreBoard()

        // highScoreList.push(...json);
        // console.log('get score from server' + highScoreList);
}
    
function topFiveScore() {
    topScore = highScoreList
    .sort(({ score: a }, { score: b }) => b - a)
    .slice(0, 5);
    
return topScore;  
};


//Show top scores
function showHiScoreBoard() {
    topFiveScore();
    console.log(topScore);

    // let table = document.querySelector(".highScoreBoard");
    // for (let i = 0; i < 5; i++) {
    //   table.rows[i + 1].cells[1].innerHTML = topFiveScore[i].player;
    //   table.rows[i + 1].cells[2].innerHTML = topFiveScore[i].score;
    // }
};   



// function getScore() {
// let scoreList = []
// const currentScore ={
//     id: Date.now,
//     name: player,
//     score: score,
// };
// scoreList.push(currentScore);
// console.log(scoreList);
// }


// function createHighScoreList (scoreList) {
//     return scoreList.map((score) => {
//         let li = `<li>${score}</li>`
//         return li
//     })
// }
// function getHighScore(score) {
//     let scoreArr = []; // Create array for score list
  
//     for (let i = 0; i < scoreArr.length; i++) {
//       if (score > scoreArr[i]) {
//         // Inserting new high score within the list
//         scoreArr.splice(i, 0, score);
//         scoreArr.length = Math.min(scoreArr.length, 5);
//         return scoreArr;
//       }
//     }
//     if (scoreArr.length < 5) {
//       // Adding to the end
//       scoreArr.push(score);
//     }
//     return scoreArr;
//   }

})

// npx json-server -p 3000 db.json