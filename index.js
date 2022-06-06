const boardWidth = boardHeight = 7
let currentTaskGameIndex = 0
let currentPosition = 0
let currentOrientation = 0
let comands = []
let gameStatus = "start" //start, running, completed, gameover
let myInterval = null
let giftsCatched = 0
let executingCommand = -1

const cells = []

let tasks = [
    {walls: [8], gifts: [25], done: false},
    {walls: [9,10,12,16,17,19,23,24,28,35,45,46,47], gifts: [4,15,34], done: false},
    {walls: [9,10,16,17,23,24,34,41,43,44,45], gifts: [12,14,20,39], done: false},
    {walls: [5,16,17,18,30,37,38,39,40,44,45,46,47], gifts: [3,15,26], done: false},
    {walls: [0,7,12,13,14,19,20,21,23,24,26,27,28,33,34,35,40,41,42], gifts: [4,9,37], done: false},
    {walls: [3,4,5,7,14,21,23,24,28,30,31,32,33,37,38,44,45], gifts: [11,39,42], done: false},
    {walls: [0,1,2,16,17,18,23,24,25,30,31,32,33,36,43], gifts: [6,21,39], done: false},
    {walls: [8,9,10,15,16,17,19,22,23,24,29,30,31,45,46,47], gifts: [6,36,40], done: false},
    {walls: [3,4,8,9,10,11,15,16,17,18,22,23,26,27,33,34,37,38,40,41,47,48], gifts: [6,25,35], done: false},
    {walls: [7,8,10,12,14,15,19,21,22,31,33,34,36,37,38,40], gifts: [13,17,41,42], done: false}
]

init()

function init(){
    tasks = JSON.parse(localStorage.getItem("status")) || tasks
    currentTaskGameIndex = +localStorage.getItem("currentFase")

    buldBoard()
    fillCells()
    
    renderClearGame()
    renderMakeGame()
    
}

function reset() {
    const out = confirm("Deseja sair do jogo?")
    if (out) {
        localStorage.removeItem("status")
        localStorage.removeItem("currentFase")
        tasks.forEach((task)=>{
            task.done = false
        })
        currentTaskGameIndex = 0
        restartGame()
    }
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

function restartGame(){
    resetDataGameTask()
    renderClearGame()
    renderMakeGame()

}
function nextTaskGame(){
    if (currentTaskGameIndex < tasks.length  - 1 & tasks[currentTaskGameIndex].done) {
        currentTaskGameIndex++
        restartGame()
    }
}
function previousTaskGame(){
    if (currentTaskGameIndex > 0) {
        currentTaskGameIndex--
        restartGame()
    }
}

function renderClearGame(){
    resetDataGameTask()
    
    document.querySelector("#result").style.display = "none"
    document.querySelector("#giftsCatched").innerHTML = giftsCatched + "/" + tasks[currentTaskGameIndex].gifts.length
    document.querySelector("#currentTaskGameIndex").innerHTML = currentTaskGameIndex+1 + "/" + tasks.length
    document.querySelector("#currentTaskGameIndexBox").classList.remove("fasePassed")
    document.querySelector("#display-comands").innerHTML = ""
    
    document.querySelectorAll(".cell").forEach((cell)=>{
        cell.style.transform = "rotate(0deg)"
        cell.classList.remove("gameover", "gift", "wall", "active", "passed")
    })

    activeCell = document.querySelectorAll(".cell")[currentPosition]
    activeCell.classList.add("passed")
}

function renderMakeGame() {
    const cellsElements = document.querySelectorAll(".cell")
    tasks[currentTaskGameIndex].walls.forEach((wall)=>{
        cellsElements[wall].classList.add("wall")
    })

    tasks[currentTaskGameIndex].gifts.forEach((wall)=>{
        cellsElements[wall].classList.add("gift")
    })

    const fasePassed = document.querySelector("#currentTaskGameIndexBox")
    tasks[currentTaskGameIndex].done ? fasePassed.classList.add("fasePassed") : fasePassed.classList.add()

    const initCell = document.querySelectorAll(".cell")[currentPosition]
    initCell.classList.add("active")
    updateOrientation()
}

function resetDataGameTask(){
    currentPosition = 0
    currentOrientation = 0
    myInterval = null
    executingCommand = -1
    giftsCatched = 0
    gameIsRunned = false
    comands = []
    gameOver = false
    gameStatus = "start"
}

function addComand(comand) {
    if(gameStatus !== "start"){return}
    comands.push(comand)
    updadeDisplayComands()

}

function playGame() {
    if(gameStatus !== "start"){return}
    gameStatus = "running"
    console.log("play");
    let i = 0
    myInterval = setInterval(()=>{
        nextCommand()
        switch (comands[i]) {
            case "forward":
                moveFoWard()
                break;
            case "back":
                moveBabk()
                break;
            case "right":
                turnRigt()
                break;
            case "left":
                turnLeft()
                break;
            default:
                break;
        }

        i++
        console.log(i, comands.length);
        if(i>=comands.length){
            clearInterval(myInterval)
            if(gameStatus !== "gameover"){
                gameStatus = "completed"
            }
            showResult()
        }
    }, 750)
}

function showResult() {
    if(gameStatus === "gameover"){
        clearInterval(myInterval)
        const activeCell = document.querySelectorAll(".cell")[currentPosition]
        activeCell.classList.add("gameover")
        document.querySelector("#result").innerHTML = "Game Over"
        document.querySelector("#result").style.display = "block"
        document.querySelector("#result").style.backgroundColor = "rgba(255, 0, 0, 0.3)"
        console.log("Game Over")
        return
    }
    if(gameStatus === "completed"){
        console.log(gameStatus);
        if (giftsCatched===tasks[currentTaskGameIndex].gifts.length){
            document.querySelector("#result").innerHTML = "DESAFIO REALIZADO COM SUCESSO"
            document.querySelector("#result").style.display = "block"
            document.querySelector("#result").style.backgroundColor = "rgba(0, 255, 0, 0.3)"
            tasks[currentTaskGameIndex].done = true

            const fasePassed = document.querySelector("#currentTaskGameIndexBox")
            tasks[currentTaskGameIndex].done ? fasePassed.classList.add("fasePassed") : fasePassed.classList.add()
            localStorage.setItem("currentFase", currentTaskGameIndex+1)
            console.log("Winner")

            localStorage.setItem("status", JSON.stringify(tasks))
        }else{
            document.querySelector("#result").innerHTML = "Tente novamente pegar todos os presentes"
            document.querySelector("#result").style.display = "block"
            document.querySelector("#result").style.backgroundColor = "rgba(255, 0, 0, 0.3)"
            console.log("Todos os comandos foram executados mas o objetivo nao foi atingido")
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

function catchGift() {
    activeCell = document.querySelectorAll(".cell")[currentPosition]
    if(activeCell.classList.contains("gift")){
        activeCell.classList.remove("gift")
        giftsCatched++
        document.querySelector("#giftsCatched").innerHTML = giftsCatched + "/" + tasks[currentTaskGameIndex].gifts.length
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

function move(param) {
    if (param===null || tasks[currentTaskGameIndex].walls.some((wall) => {return wall === param})){
        gameStatus = "gameover"
        console.log("gameover");
        showResult()
    }else{
        activeCell = document.querySelectorAll(".cell")[currentPosition]
        activeCell.classList.remove("active")
        currentPosition = param
        catchGift()
        activeCell.classList.add("passed")
        activeCell.classList.add("active")
        updateOrientation()
    }
}
function moveFoWard(){
    switch (currentOrientation) {
        case 0:
            move(cells[currentPosition].cellRight)
            break;
        case 90:
            move(cells[currentPosition].cellBottom)
            break;
        case 180:
            move(cells[currentPosition].cellLeft)
            break;
        case 270:
            move(cells[currentPosition].cellTop)
            break;
                        
        default:
            break;
    }
}
function moveBabk(){
    switch (currentOrientation) {
        case 0:
            move(cells[currentPosition].cellLeft)
            break;
        case 90:
            move(cells[currentPosition].cellTop)
            break;
        case 180:
            move(cells[currentPosition].cellRight)
            break;
        case 270:
            move(cells[currentPosition].cellBottom)
            break;    
        default:
            break;
    }
}

function turnRigt(){
    currentOrientation === 270 ? currentOrientation = 0 : currentOrientation += 90
    updateOrientation()
}
function turnLeft(){
    currentOrientation === 0 ? currentOrientation = 270 : currentOrientation -= 90
    updateOrientation()
}
function updateOrientation() {
    let activeCell = document.querySelectorAll(".cell")[currentPosition]
    activeCell.style.transform = `rotate(${currentOrientation}deg)`
}
