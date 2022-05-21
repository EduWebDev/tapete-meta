const [boardWidth, boardHeight] = [7,7]
const cells = []
let comands = []
const tasksGame = {
    walls: [[5,6,13], [9,32,33], [2,26,37]],
    gifts: [[4,10,1], [7,11,28], [4,29,35]]
}
let currentTaskGameIndex = 0
let giftsCatched = 0
let gameMode = true
let currentPosition = 0
let currentOrientation = 0
let myInterval = null
let executingCommand = -1
let gameOver = false
let gameCommandsRunned = false


init()

function init() {
    buldBoard()
    fillCells()
    restartGame()
    currentPosition = 0
    const initCell = document.querySelectorAll(".cell")[currentPosition]
    initCell.classList.add("active")
    buldTaskGame()
}

function nextTaksGame(arg) {
    if(arg==="next"){
        if(currentTaskGameIndex < tasksGame.walls.length-1){
            currentTaskGameIndex++
            restartGame()
        }
    }
    if(arg==="previous"){
        if(currentTaskGameIndex > 0){
            currentTaskGameIndex--
            restartGame()
        }
    }
}

function handleGameMode() {
    restartGame()
    const gameModeCheckbox = document.querySelector("#gameMode")
    gameModeCheckbox.checked ? gameMode = true : gameMode = false
}

function restartGame() {
    clearAllCells()
    currentPosition = 0
    currentOrientation = 0
    myInterval = null
    executingCommand = -1
    giftsCatched = 0
    gameCommandsRunned = false
    const initCell = document.querySelectorAll(".cell")[currentPosition]
    initCell.classList.add("active")
    updateOrientation()
    comands = []
    document.querySelector("#display-comands").innerHTML = ""
    document.querySelector("#currentTaskGameIndex").innerHTML = currentTaskGameIndex+1 + "/" + tasksGame.walls.length
    document.querySelector("#giftsCatched").innerHTML = giftsCatched + "/" + tasksGame.gifts[currentTaskGameIndex].length
    document.querySelector("#result").style.display = "none"
    gameOver = false
    buldTaskGame()

    document.querySelectorAll(".cell").forEach((cell)=>{
        cell.style.transform = "rotate(0deg)"
        cell.classList.remove("gameover")
        cell.classList.remove("gift")
        cell.classList.remove("wall")
    })
    buldTaskGame()

}

function addComand(comand) {
    if(gameOver || gameCommandsRunned){return}
    comands.push(comand)
    updadeDisplayComands()

    if(gameMode===false){
        if(comand === "forward" || comand === "back"){
            move(comand)
        }else if(comand === "right" || comand === "left"){
            turn(comand)
        }
    }
}

function updadeDisplayComands() {
    const displayComands = document.querySelector("#display-comands")
    displayComands.innerHTML = ""
    comands.forEach((comand)=>{
        switch (comand) {
            case "forward":
                displayComands.innerHTML += '<i class="commandDisplayed material-icons">arrow_upward</i>'
                break;
            case "back":
                displayComands.innerHTML += '<i class="commandDisplayed material-icons">arrow_downward</i>'
                break;
            case "right":
                displayComands.innerHTML += '<i class="commandDisplayed material-icons">redo</i>'
                break;
            case "left":
                displayComands.innerHTML += '<i class="commandDisplayed material-icons">undo</i>'
                break;
        
            default:
                break;
        }
    })
}

function runComands() {
    if(gameOver || !gameMode || gameCommandsRunned){return}
    let i = 0
    myInterval = setInterval(()=>{
        if(comands[i] === "forward" || comands[i] === "back"){
            move(comands[i])
        }else if(comands[i] === "right" || comands[i] === "left"){
            turn(comands[i])
        }
        i++
        if(i>=comands.length){
            clearInterval(myInterval)
            gameCommandsRunned = true
            if (giftsCatched===tasksGame.gifts[currentTaskGameIndex].length){
                document.querySelector("#result").innerHTML = "DESAFIO REALIZADO COM SUCESSO"
                document.querySelector("#result").style.display = "block"
                document.querySelector("#result").style.backgroundColor = "rgba(0, 255, 0, 0.3)"
            }
        }
    }, 750)
    
}

function buldBoard() {
    const boardElement = document.querySelector("#game #board")
    boardElement.innerHTML = ""
    for (let i = 0; i < boardHeight; i++) {
        boardElement.innerHTML += `<div class="row"></div>`
        for (let j = 0; j < boardWidth; j++) {
            const rowElement = document.querySelector(".row:last-child")
            rowElement.innerHTML += `<div class="cell"></div>`
        }
    }
}

function fillCells() {
    let countCellsArray = 0
    for (let i = 1; i <= boardHeight; i++) {
        for (let j = 1; j <= boardWidth; j++) {
            cells[countCellsArray] = {
                cellCenter: countCellsArray,
                cellTop: i-1 <= 0 ? null : countCellsArray-boardWidth, 
                cellRight: j+1 > boardWidth ? null : countCellsArray+1,
                cellLeft: j-1 <= 0 ? null : countCellsArray-1,
                cellBottom: i+1 > boardHeight ? null : countCellsArray+boardWidth,
                state: "blank, passed, active, bomb, gift, wall, target"
            }
            countCellsArray++
        }  
    }
}

function buldTaskGame() {
    const cellsElements = document.querySelectorAll(".cell")
    tasksGame.walls[currentTaskGameIndex].forEach((wall)=>{
        cellsElements[wall].classList.add("wall")
    })
    tasksGame.gifts[currentTaskGameIndex].forEach((wall)=>{
        cellsElements[wall].classList.add("gift")
    })
}

function clearAllCells() {
    const allCells = document.querySelectorAll(".cell")
    allCells.forEach((cell)=>{
        cell.classList.remove("active")
        cell.classList.remove("passed")

    })
}


function turn(rightOrLeft) {
    if (rightOrLeft === "right") {
        currentOrientation = currentOrientation === 270 ? 0 : currentOrientation + 90
    }else if(rightOrLeft === "left"){
        currentOrientation = currentOrientation === 0 ? 270 : currentOrientation - 90
    }
    
    let activeCell = document.querySelectorAll(".cell")[currentPosition]
    activeCell.style.transform = `rotate(${currentOrientation}deg)`

    nextCommand()
}

function updateOrientation() {
    let activeCell = document.querySelectorAll(".cell")[currentPosition]
    activeCell.style.transform = `rotate(${currentOrientation}deg)`
}

function move(forwardOrBack) {
    let activeCell = document.querySelectorAll(".cell")[currentPosition]
    activeCell.classList.remove("active")
    activeCell.classList.add("passed")
    
    let newCurrentPosition = null
    switch (currentOrientation) {
        case 0:
            newCurrentPosition = forwardOrBack === "forward" ? cells[currentPosition].cellRight : cells[currentPosition].cellLeft
            if(newCurrentPosition === null || tasksGame.walls[currentTaskGameIndex].some((wall)=>{return wall === newCurrentPosition})){
                activeCell.classList.add("active")
                nextCommand()
                isGameOver()
                break;
            }
            currentPosition = newCurrentPosition
            activeCell = document.querySelectorAll(".cell")[currentPosition]
            activeCell.classList.add("active")
            updateOrientation()

            catchGift()
            nextCommand()
            break;

        case 270:
            newCurrentPosition = forwardOrBack === "forward" ? cells[currentPosition].cellTop : cells[currentPosition].cellBottom
            if(newCurrentPosition === null || tasksGame.walls[currentTaskGameIndex].some((wall)=>{return wall === newCurrentPosition})){
                activeCell.classList.add("active")
                nextCommand()
                isGameOver()
                break;
            }
            currentPosition = newCurrentPosition
            activeCell = document.querySelectorAll(".cell")[currentPosition]
            activeCell.classList.add("active")
            updateOrientation()
            
            catchGift()
            nextCommand()
            break;

        case 180:
            newCurrentPosition = forwardOrBack === "forward" ? cells[currentPosition].cellLeft : cells[currentPosition].cellRight
            if(newCurrentPosition === null || tasksGame.walls[currentTaskGameIndex].some((wall)=>{return wall === newCurrentPosition})){
                activeCell.classList.add("active")
                nextCommand()
                isGameOver()
                break;
            }
            currentPosition = newCurrentPosition
            activeCell = document.querySelectorAll(".cell")[currentPosition]
            activeCell.classList.add("active")
            updateOrientation()
            
            catchGift()
            nextCommand()
            break;

        case 90:
            newCurrentPosition = forwardOrBack === "forward" ? cells[currentPosition].cellBottom : cells[currentPosition].cellTop
            if(newCurrentPosition === null || tasksGame.walls[currentTaskGameIndex].some((wall)=>{return wall === newCurrentPosition})){
                activeCell.classList.add("active")
                nextCommand()
                isGameOver()
                break;
            }
            currentPosition = newCurrentPosition
            activeCell = document.querySelectorAll(".cell")[currentPosition]
            activeCell.classList.add("active")
            updateOrientation()
            
            catchGift()
            nextCommand()
            break;
    
        default:
            break;
    }
}

function catchGift() {
    activeCell = document.querySelectorAll(".cell")[currentPosition]
    if(activeCell.classList.contains("gift")){
        activeCell.classList.remove("gift")
        giftsCatched++
        document.querySelector("#giftsCatched").innerHTML = giftsCatched + "/" + tasksGame.gifts[currentTaskGameIndex].length
    }    
}

function nextCommand() {
    let commandDisplayed
    if(executingCommand >= 0){
        commandDisplayed = document.querySelectorAll(".commandDisplayed")[executingCommand]
        commandDisplayed.classList.remove("executing")
    }
    executingCommand++
    commandDisplayed = document.querySelectorAll(".commandDisplayed")[executingCommand]
    commandDisplayed.classList.add("executing")
}

function isGameOver() {
    const activeCell = document.querySelectorAll(".cell")[currentPosition]
    activeCell.classList.add("gameover")
    clearInterval(myInterval)
    gameOver = true
    document.querySelector("#result").innerHTML = "Game Over!"
    document.querySelector("#result").style.display = "block"
    document.querySelector("#result").style.backgroundColor = "rgba(255, 0, 0, 0.3)"
    console.log("Game Over")
}