/**
 * @author Rohan Pai
 *  http://rohanpai.com
 *
 */


/**
 * Board represents a model-like object that describes
 * the current state of the game board. In addition,
 * the functionality to check if there is a winner and
 * which is the current player is, is provided here.
 *
 */
var Board = function(){

    return {

        grid: null,

        currentPlayer: null,

        hasWinner: false,

        winningPosition: null,

        /**
         * init - sets up the gameboard
         *
         */
        init: function(){
            this.grid = new Array(3);
            for (var i = 0; i < 3; i++) {
                this.grid[i] = new Array(3);
            }
            this.currentPlayer = 0
        },

        /**
         * reset - resets the game board to create new
         *  game without reinit of object
         *
         */
        reset: function(){
            this.init();
            this.hasWinner = false;
            this.winningPosition = null;
        },

        /**
         * getCurrentPlayerTitle - returns who the
         *  current player is
         *
         */
        getCurrentPlayerTitle: function(x, y){
            if (this.currentPlayer == 1){
                return "Player X"
            } else {
                return "Player O"
            }
        },

        /**
         * toggleGridPosition - togggles position on game board
         *
         */
        toggleGridPosition: function(x, y){
            //ensure the grid is open
            if (this.grid[x][y] == 0 || this.grid[x][y] == 1){
                return false
            }
            this.grid[x][y] = this.currentPlayer;
            this.currentPlayer = (this.currentPlayer + 1) % 2;
        },

        getWinningPlayer: function(){
            if(!this.hasWinner)
                return
            return this.grid[this.winningPosition[0][0]]
        },

        /**
         * checkForWinner checks if the winner is 
         *  on the board
         *  there could have been some smarter checking
         *  that only checks around the last toggled entry
         *  but I did not have time for that
         *
         */
        checkForWinner: function(){
            
            //check rows
            for (var i = 0; i < this.grid.length; i++) {
                if (this.grid[i][0] != null 
                        && this.grid[i][0] == this.grid[i][1] 
                        && this.grid[i][0] == this.grid[i][2]){
                    this.hasWinner = true;
                    this.winningPosition = [[i][0],[i][1],[i][2]];
                }
            }
            //check cols
            for (var i = 0; i < this.grid.length; i++) {
                if (this.grid[0][i] != null 
                        && this.grid[0][i] == this.grid[1][i]
                        && this.grid[0][i] == this.grid[2][i]){
                    this.hasWinner = true;
                    this.winningPosition = [[0][i],[1][i],[2][i]];                  
                }
            }

            //check diags            
            if (this.grid[0][0] != null 
                    && this.grid[0][0] == this.grid[1][1] 
                    && this.grid[0][0] == this.grid[2][2]){
                this.hasWinner = true;
                this.winningPosition = [[0][0],[1][1],[2][2]];                  
            }

            if (this.grid[2][0] != null 
                    && this.grid[2][0] == this.grid[1][1] 
                    && this.grid[2][0] == this.grid[0][2]){
                this.hasWinner = true;
                this.winningPosition = [[2][0],[1][1],[0][3]];                    
            }
            
            if (this.hasWinner)
                return true

            return false
        }
    
    }
}

/**
 * App provides view/view-controller like functionality
 *
 */

var App = function(){

    return {

        canvas: null,

        players: null,

        board: null,
        
        lastDrawTime: null,        

        width: 500,

        height: 500,

        padding: 20,

        fps: 30,

        primaryFillColor: "#39ace6",

        shouldIncreaseTextOpacity: -1,
        
        currentTextOpacity: 1000,

        currentMouseX: 0,

        currentMouseY: 0,

        currentPlayerRef: null,

        newGameElem: null,

        currentPlayerElem: null,

        winnerElem: null,
        
        /**
         * init - initializes the canvas/game board
         *  this should only be called once
         *  if need to restart game see reset()
         *
         */
        init: function(){
            //set up canvas
            //attempt to use 'this' as few times as possible
            var canvas;
            canvas = document.createElement('canvas');
            canvas.id = "gameBoard";
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.addEventListener('mousedown', function(e){ this.mouseDown(e) }.bind(this), false);
            canvas.addEventListener('mousemove', function(e){ this.mouseMove(e) }.bind(this), false);            
            this.canvas = canvas 
            document.getElementsByTagName('body')[0].appendChild(this.canvas);
       
            // create the board (model-like object)
            this.board = new Board();
            this.board.init();

            var that = this
            this.newGameElem = document.getElementById('newGame');
            this.newGameElem.onclick = function() {that.reset()};
            this.winnerElem = document.getElementById('winner');
            this.currentPlayerElem = document.getElementById('currentPlayer');
            this.showCurrentPlayer()

            //begin drawing the canvas
            this.draw();

        },

        /**
         * reset - resets the game board for a new game
         *
         */
        reset: function() {
            this.board.reset();
            this.showCurrentPlayer();
            this.winnerElem.innerHTML = ""
        },

        /**
         * draw - redraws the canvas for ~ 30fps experience
         *  since time in js is unreliable, we sometimes use
         *  the time difference to do animations
         *
         *  draws the boxes and the state that the 'board'
         *  is currently in
         */
        draw: function(){
            var now = new Date().getTime();
            var dt = now - (this.lastDrawTime || now);
            this.lastDrawTime = now;

            //make the breathing effect a function of time since time is 
            //unreliable in javascript
            this.currentTextOpacity = this.shouldIncreaseTextOpacity * dt / 3 + this.currentTextOpacity;
                        
            if (this.currentTextOpacity > 1000)
                this.shouldIncreaseTextOpacity = -1
            if (this.currentTextOpacity < 450)
                this.shouldIncreaseTextOpacity = 1

            var ctx = this.canvas.getContext("2d");

            //empty the canvas
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, this.width, this.height);

            //spacing between boxes
            var horozontalSpacing = this.width / 3;
            var verticalSpacing = this.height / 3;
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    ctx.fillStyle = this.primaryFillColor;
                    
                    //boxPosition with a small alteration depending on mouse location
                    var boxPosX = i*horozontalSpacing + (this.padding * this.currentMouseX/this.width / 7.0)
                    var boxPosY = j*verticalSpacing + (this.padding * this.currentMouseY/this.height / 7.0)
                    ctx.fillRect(boxPosX, boxPosY, horozontalSpacing-this.padding,verticalSpacing-this.padding);
                    
                    //do the following if the space on the board is occupied
                    if (this.board.grid[i][j] != null){
                        ctx.fillStyle = "rgba(255, 255, 255, "+this.currentTextOpacity/1000+")";
                        ctx.font = "32px Arial";

                        var player = (this.board.grid[i][j]) ? 'X' : 'O';
                        //calculat the position but add a tweak depending on mouse location
                        var playerPosX = i*horozontalSpacing + this.width/8 + (this.padding * this.currentMouseX/this.width / 3.0);
                        var playerPosY = j*verticalSpacing+this.height/6 + (this.padding * this.currentMouseY/this.height / 3.0);
                        
                        ctx.fillText(player, playerPosX, playerPosY);
                    }
                }
            }
            
            //invoke command to redraw the canvas to create ~ 30 fps 
            var that = this
            setTimeout(function(){ that.draw()}, 1000 / this.fps);
             
        },
        
        /**
         * showCurrentPlayer - this shows the current player in DOM
         *  since this function is used more than once, it made sense
         *  to put it in a function
         *
         */
        showCurrentPlayer: function(){
            var currentPlayer = this.board.getCurrentPlayerTitle()
            this.currentPlayerElem.innerHTML = "Current Player: "+currentPlayer        
        },

        getMouseX: function(event) {
            return event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(this.canvas.offsetLeft);
        },

        getMouseY: function(event) {
            return event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(this.canvas.offsetTop) + 1;
        },

        mouseMove: function(event){
            this.currentMouseX = this.getMouseX(event)
            this.currentMouseY = this.getMouseY(event)
        },

        mouseDown: function(event){
            if (this.board.hasWinner)
                return
            currentPlayer = this.board.getCurrentPlayerTitle()
            var clickedX = this.getMouseX(event)
            var clickedY = this.getMouseY(event)
            this.board.toggleGridPosition(parseInt(clickedX/this.width * 3), parseInt(clickedY/this.height * 3))
            if (this.board.checkForWinner()){
                this.winnerElem.innerHTML = "Winner: " + currentPlayer
            } else {
                this.showCurrentPlayer()
            }
        }

    }
}
