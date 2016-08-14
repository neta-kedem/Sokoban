'use strict';
var gSteps = 0;
var gBoard;
var gGameDone = false;
var gLevel = {
    level: 1,
    SIZE: 6,
    boxesCount: 0
}
var gPlayerPos = {
    i: 0,
    j: 0
};
var SPACE = ' ';
var BOX = '@';
var PLAYER = '&#9791';

function init(value) {
    gSteps = 0;
    gGameDone = false;
    var numValue = +value;
    gLevel.level = numValue;
    if (numValue === 2) setBoardLevel2();
    else setBoardLevel1();
}

function buildBoard(size) {
    gBoard = [];
    for (var i = 0; i < size; i++) {
        gBoard.push([]);
        for (var j = 0; j < size; j++) {
            gBoard[i][j] = {
                isBox: false,
                isBlackHole: false,
                isTarget: false,
                isWall: false,
                isGlue: false
            };
        }
    }

}

function setBoardLevel1() {
    var size = 6;
    buildBoard(size);

    gBoard[1][1].isBox = true;
    gLevel.boxesCount++;

    gBoard[1][2].isBox = true;
    gLevel.boxesCount++;

    gBoard[1][3].isBox = true;
    gLevel.boxesCount++;
    gPlayerPos.i = 0;
    gPlayerPos.j = 1;
    gBoard[3][1].isTarget = true;
    gBoard[3][2].isTarget = true;
    gBoard[3][3].isTarget = true;
    var randLine = parseInt(Math.random() * size);
    var randRow = parseInt(Math.random() * size);
    if ((!gBoard[randLine][randRow].isWall) &&
        (!gBoard[randLine][randRow].isTarget) &&
        (!gBoard[randLine][randRow].isBox) &&
        (!gBoard[randLine][randRow].isBlackHole) &&
        (!gBoard[randLine][randRow].isGlue) &&
        (randLine !== gPlayerPos.i) &&
        (randRow !== gPlayerPos.j))
        gBoard[randLine][randRow].isGlue = true;

    var randLine = parseInt(Math.random() * size);
    var randRow = parseInt(Math.random() * size);
    if ((!gBoard[randLine][randRow].isWall) &&
        (!gBoard[randLine][randRow].isTarget) &&
        (!gBoard[randLine][randRow].isBox) &&
        (!gBoard[randLine][randRow].isBlackHole) &&
        (!gBoard[randLine][randRow].isGlue) &&
        (randLine !== gPlayerPos.i) &&
        (randRow !== gPlayerPos.j))
        gBoard[randLine][randRow].isBlackHole = true;

    renderBoard(gBoard);

}

function setBoardLevel2() {
    gBoard = [];
    var size = 6;
    buildBoard(size);

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (i === 0 ||
                j === 0 ||
                i === size - 1 ||
                j === size - 1)
                gBoard[i][j].isWall = true;
            if (j === size - 2)
                gBoard[i][j].isWall = true;
            if ((i === 3 && j === 1) || (i === 4 && j === 1))
                gBoard[i][j].isWall = true;
        }
    }


    gBoard[1][2].isBox = true;
    gLevel.boxesCount++;

    gBoard[2][2].isBox = true;
    gLevel.boxesCount++;
    gPlayerPos.i = 1;
    gPlayerPos.j = 1;
    gBoard[2][1].isTarget = true;
    gBoard[1][3].isTarget = true;

    renderBoard(gBoard);
}

function renderBoard(board) {
    var elContainer = document.querySelector('.table');
    var strHTML = '<table border="1"><tbody>';
    board.forEach(function (row, i) {
        strHTML += '<tr>';
        row.forEach(function (cell, j) {
            var className = 'cell cell-' + i + '-' + j;

            if (board[i][j].isTarget) {
                className += ' target';
            }
            if (board[i][j].isWall) {
                className += ' wall';
            }
            if (board[i][j].isGlue) {
                className += ' glue';
            }
            if (board[i][j].isBlackHole) {
                className += ' blackHole';
            }
            var textInCell = (board[i][j].isBox) ? BOX : SPACE;
            strHTML += '<td class="' + className + '"> ' + textInCell + ' </td>';
        });
        strHTML += '</tr>'
    });
    strHTML += '</tbody></table>';
    elContainer.innerHTML = strHTML;

    var cellClass = '.cell-' + (gPlayerPos.i) + '-' + (gPlayerPos.j);
    document.querySelector(cellClass).innerHTML = PLAYER;

    document.querySelector('.stepsCounter').innerHTML = gSteps;

}

function movePlayer(event) {
    if(gGameDone) return;
    var prevPlayerPos = {
        i: gPlayerPos.i,
        j: gPlayerPos.j
    };
    var newPlayerPos = getNewPos(prevPlayerPos, event)
    if (isValidLocation(event, gBoard)) {
        gSteps++;
        document.querySelector('.stepsCounter').innerHTML = gSteps;
        var cellClass = '.cell-' + (gPlayerPos.i) + '-' + (gPlayerPos.j);
        document.querySelector(cellClass).innerHTML = SPACE;

        if (gBoard[newPlayerPos.i][newPlayerPos.j].isBlackHole) {
            alert("you fell to the valley of death");
            init(gLevel.level);
            return;
        }
        var cellClass = '.cell-' + (newPlayerPos.i) + '-' + (newPlayerPos.j);
        document.querySelector(cellClass).innerHTML = PLAYER;
        //if there is a box there, move it
        if (gBoard[newPlayerPos.i][newPlayerPos.j].isBox) {
            gBoard[newPlayerPos.i][newPlayerPos.j].isBox = false;
            var objPos = getNewPos(newPlayerPos, event);

            if (gBoard[newPlayerPos.i][newPlayerPos.j].isGlue) {
                wait(3000);
            }

            if (gBoard[objPos.i][objPos.j].isTarget) {
                gLevel.boxesCount--;
            }
            if (gBoard[newPlayerPos.i][newPlayerPos.j].isTarget) {
                gLevel.boxesCount++;
            }
            if (!gBoard[objPos.i][objPos.j].isBlackHole) {
                gBoard[objPos.i][objPos.j].isBox = true;
                var cellClass = '.cell-' + (objPos.i) + '-' + (objPos.j);
                document.querySelector(cellClass).innerHTML = BOX;
            }
        }

        if (gBoard[newPlayerPos.i][newPlayerPos.j].isGlue) {
            gSteps += 4;

        }
        if (gBoard[prevPlayerPos.i][prevPlayerPos.j].isGlue) {
            wait(3000);
        }
        gPlayerPos.i = newPlayerPos.i;
        gPlayerPos.j = newPlayerPos.j;

        if (isGameOver()) {
            alert('YOU WIN! you did it in ' + gSteps + ' steps');
            gGameDone = true;
            // setBoardLevel2();
        }
    }
}

function getNewPos(oldPos, event) {
    var newPos = {
        i: oldPos.i,
        j: oldPos.j
    };
    switch (event.code) {

    case 'ArrowUp':
        newPos.i--;
        break;
    case 'ArrowDown':
        newPos.i++;
        break;
    case 'ArrowLeft':
        newPos.j--;
        break;
    case 'ArrowRight':
        newPos.j++;
        break;
    default:
        return null;
    }
    return newPos;
}

function isValidLocation(event, board) {
    //playet hit a wall
    var newPlayerPos = getNewPos(gPlayerPos, event);
    if (!newPlayerPos) return false;
    if (newPlayerPos.i < 0 ||
        newPlayerPos.i >= board.length ||
        newPlayerPos.j < 0 ||
        newPlayerPos.j >= board.length) {
        return false;
    }
    if (board[newPlayerPos.i][newPlayerPos.j].isWall)
        return false;

    if (board[newPlayerPos.i][newPlayerPos.j].isBox) {
        var sameDirectionNextPos = getNewPos(newPlayerPos, event)

        if (sameDirectionNextPos.i < 0 ||
            sameDirectionNextPos.i >= board.length ||
            sameDirectionNextPos.j < 0 ||
            sameDirectionNextPos.j >= board.length) {
            return false;
        }
        if (board[sameDirectionNextPos.i][sameDirectionNextPos.j].isWall)
            return false;

        if (board[sameDirectionNextPos.i][sameDirectionNextPos.j].isBox) {
            return false;
        }
    }
    return true;
}

function isObsta(newPos) {
    if (!gBoard[newPos.i][newPos.j]) {
        return
    }
    return true;
}

function isGameOver() {
    if (!gLevel.boxesCount) return true;
    return false;
}

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

//not to accidently change level when you want to move
function ignoreAlpha(e)
{
    if (!e)
    {
        e = window.event ;
    }
    
    e.returnValue=false;
    e.cancel = true;
    
}