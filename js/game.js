/**
 * Helpers and tools to ease your JavaScript day.
 *
 * @author Rasmus Berg
 */
window.Cos = (function(window, document, undefined ) {
  var Cos = {};

  Cos.createCookie = function(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        var expires = "; expires=" + date.toUTCString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
  };

  Cos.readCookie = function(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
      return null;
  };

  Cos.eraseCookie = function(name) {
      createCookie(name,"",-1);
  };

  /**
   * Draws a rounded rectangle using the current state of the canvas.
   * If you omit the last three params, it will draw a rectangle outline with a 5 pixel border radius
   * @param {CanvasRenderingContext2D} ctx
   * @param {Number} x The top left x coordinate
   * @param {Number} y The top left y coordinate
   * @param {Number} width The width of the rectangle
   * @param {Number} height The height of the rectangle
   * @param {Number} [radius = 5] The corner radius; It can also be an object to specify different radii for corners
   * @param {Boolean} [fill = true] Whether to fill the rectangle.
   * @param {Boolean} [stroke = false] Whether to stroke the rectangle.
   *
   * Made by: Juan Mendes
   * Homepage: http://js-bits.blogspot.se/2010/07/canvas-rounded-corner-rectangles.html
   */
  Cos.roundRect = function (ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
      stroke = false;
    }
    if (typeof fill == 'undefined') {
      fill = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
      ctx.moveTo(x + radius.tl, y);
      ctx.lineTo(x + width - radius.tr, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
      ctx.lineTo(x + width, y + height - radius.br);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
      ctx.lineTo(x + radius.bl, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
      ctx.lineTo(x, y + radius.tl);
      ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  };
  
  // Expose public methods
  return Cos;
  
})(window, window.document);

/**
 * Shim layer, polyfill, for requestAnimationFrame with setTimeout fallback.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
 
window.requestAnimFrame = (function(){
  return window.requestAnimationFrame       ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame    ||
         window.oRequestAnimationFrame      ||
         window.msRequestAnimationFrame     ||
         function( callback ){
           window.setTimeout(callback, 1000 / 60);
         };
})();

/**
 * Shim layer, polyfill, for cancelAnimationFrame with setTimeout fallback.
 */
 
window.cancelRequestAnimFrame = (function(){
  return window.cancelRequestAnimationFrame       ||
         window.webkitCancelRequestAnimationFrame ||
         window.mozCancelRequestAnimationFrame    ||
         window.oCancelRequestAnimationFrame      ||
         window.msCancelRequestAnimationFrame     ||
         window.clearTimeout;
})();

/**
 * Trace the keys pressed
 * http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/index.html
 */
 
window.Key = {
  pressed: {},

  LEFT:   37, // Left-arrow
  RIGHT:  39, // Right-arrow
  FIRE:   32, // Space
  A:      65, // A
  D:      68, // D
  P:      80, // P
  PAUSE:  19, // Pause-button
  S:      83, // S
  R:      82, // R

  isDown: function(keyCode) {
    return this.pressed[keyCode];
  },

  onKeydown: function(event) {
    this.pressed[event.keyCode] = true;
  },

  onKeyup: function(event) {
    delete this.pressed[event.keyCode];
  }
};
window.addEventListener('keyup',   function(event) {window.Key.onKeyup(event);},   false);
window.addEventListener('keydown', function(event) {window.Key.onKeydown(event);}, false);

/**
 * Vector position
 */
 
function Vector(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Vector.prototype = {
  muls:  function (scalar) { return new Vector( this.x * scalar, this.y * scalar); },
  imuls: function (scalar) { this.x *= scalar; this.y *= scalar; return this; },
  adds:  function (scalar) { return new Vector( this.x + scalar, this.y + scalar); },
  iadd:  function (vector) { this.x += vector.x; this.y += vector.y; return this; }
};

/**
 * Settings
 */

function Settings () {
  this.audio = (!Cos.readCookie('si_audio')) ? true : (Cos.readCookie('si_audio') == 'false') ? false : true;
}

Settings.prototype = {
  setAudio: function(toSet){
    if(typeof(toSet) === 'boolean'){
      this.audio = toSet;
      Cos.createCookie('si_audio', toSet, 7);
    }
  }
};

/**
 * Set status mode on game and render message and audio about it, also helping with handle levels and the game ending.
 */
 
function GameStatus (gameStatus, maxLevel, settings) {
  this.status = gameStatus;   // Game status
  this.level = 1;             // Level player is on
  this.hasRender = 0;         // To avoid redo render of stop-message
  this.maxLevel = maxLevel;   // Max level player can get to
  this.settings = settings;   // Settings object
}

GameStatus.prototype = {
  // Set game status
  setStatus: function(toSet){
    if(!isNaN(toSet) && toSet === parseInt(toSet, 10)){
      this.status = toSet;
    }
  },
  
  // Remove hasRender status
  removeHasRender: function(){
    this.hasRender = 0;
  },
  
  // Render game status message
  render: function(ct, width, height, txt){
    if(!this.hasRender){
      this.hasRender = 1;
      var x = width/2;
      var y = height/2;
      var retangleHeight = 250;
      var retangleWidth = 400;
      
      // Add small spaces between letters for letter-spacing
      txt[0]['txt'] = txt[0]['txt'].split("").join(String.fromCharCode(8201));
      txt[1]['txt'] = txt[1]['txt'].split("").join(String.fromCharCode(8201));

      ct.save();
        ct.translate(x, y);
        // Round retangle (aka border-radius)
        ct.fillStyle = 'rgba(0,0,0,0.45)';
        Cos.roundRect(ct, -(retangleWidth/2), -(retangleHeight/2), retangleWidth, retangleHeight);
        ct.textAlign = 'center';
        
        // First text with black line around
        ct.font = "50px impact";
        ct.strokeStyle = 'black';
        ct.fillStyle = txt[0]['color'];
        ct.strokeText(txt[0]['txt'], 0, -25);
        ct.fillText(txt[0]['txt'], 0, -25);
        
        // Second text with black line around
        ct.font = "18px impact";
        ct.fillStyle = txt[1]['color'];
        ct.strokeText(txt[1]['txt'], 0, 5);
        ct.fillText(txt[1]['txt'], 0, 5);
      ct.restore();
    }
  },
  
  // Set game over status on game and play audio effect
  gameOver: function() {
    this.status = 5;
    
    if(this.settings.audio){
      $("#gameover")[0].play();
    }
    
    console.log('Game Over: Players base is hit!');
  },
  
  // Set status for level up or finish game if max level is reach, and play audio effect
  wins: function(){
    if(this.settings.audio){
      $("#win")[0].play();
    }
    
    var nextLevel = this.level + 1;
    if(this.maxLevel < nextLevel){
      this.status = 4;
    
      console.log("You WON: you have take care of all aliens in this game!");
    }
    else{
      this.status = 3;
    
      console.log("Level up: you have taken care of all aliens on level #" + this.level + "!");
    }
  },
  
  // Level up to next level
  levelUp: function() {
    this.level++;
  }
};

/**
 * Aliens as an object
 */  
 
function Aliens(width, canvasWidth, alienEnimes, player, gameStatus) {
  this.width       = width;                   // Alien half outerwidth
  this.alienEnimes = alienEnimes;             // Max types of aliens in game
  this.player      = player;                  // Player object
  this.gameStatus  = gameStatus;              // GameStatus object
  this.aliens      = [];                      // Aliens to takecare of
  this.perRow      = canvasWidth/(2*width)-2; // Aliens per row set by canvas width divade by outerwidth minus two for some space between rows
  
  this.init();
}

Aliens.prototype = {
  // Calculate and make aliens array
  init: function(){
    var rows      = this.gameStatus.level + 3; // Add one row per level, game start with four rows
    var direction = 'left';                    // First row is going to left
    
    for (var r = rows, a = 0; r > 0 ; r--) {
      for (var i = 0; i < this.perRow; i++) {
        // width, position, direction, player object, points (by row count), imgIndex (if max level is 7 and count of alien enimes is 15 so will it start on 5 and go to 15, but if max level and count alien enimes is 15 it will start on 1)       
        this.aliens[a++] = new Alien(this.width, new Vector(2*this.width*i+this.width+25, 2*this.width*(rows-r+1)+10), direction, this.player, r, (this.alienEnimes - (this.gameStatus.maxLevel + 3)) + r);
      }
      
      direction = (direction == 'left') ? 'right' : 'left';
    }
  },
  
  // Draw aliens
  draw: function(ct) {
    for (var i = 0; i < this.aliens.length; i++) {
      this.aliens[i].draw(ct);
    }
  }, 
  
  // Update aliens
  update: function(td, width) {
    var noMoreAliens = true;
    for (var i = 0; i < this.aliens.length; i++){
      this.aliens[i].update(td, width);
      if (!this.aliens[i].hit) {
        noMoreAliens = false;
      }
    }
    // Level is finish if no aliens is left
    if (noMoreAliens) {
      this.gameStatus.wins();
    }
  },
  
  // Check if any alien is hit by a laser-shoot
  hit: function(laserPos) {
    for (var i = 0; i < this.aliens.length; i++) {
      if(this.aliens[i].alienHit(laserPos)){
        return true;
        break;
      }
    }
    
    return false;
  }
}

/**
 * A Alien as an object.
 */
 
function Alien(width, position, direction, player, points, imgIndex) {
  this.width        = width     || 32;           // Alien outerwidth
  this.position     = position  || new Vector(); // Position
  this.direction    = direction || 'left';       // Moving direction
  this.player       = player;                    // Player object   
  this.points       = points;                    // What the player get in points when alien is left
  this.hit          = 0;                         // If alien is hit
  this.img          = new window.Image();        // Alien img object
  this.img.src      = "img/space_invaders/alien" + imgIndex + ".png";
  this.hitImg       = new window.Image();        // Alien hit img object
  this.hitImg.src   = "img/space_invaders/hit.png";
}

Alien.prototype = {
  // Draw alien
  draw: function(ct) {
    if(this.hit < 2) {
      ct.save();
      ct.translate(this.position.x, this.position.y);
      ct.beginPath();
      // Draw alien
      if (this.hit == 0) {
        ct.drawImage(this.img, -16, -16, 32, 32);
      }
      // Draw hit
      else {
        ct.drawImage(this.hitImg, -16, -16, 32, 32);
        this.hit = 2;
      }
      ct.restore();
    }
  },
  
  // Update alien
  update: function(td, width) {
    // If direction left remove one pixel + timediff
    if (this.direction == 'left') {
      this.position.x -= 1 + td;
    }
    // Else add one pixel + timediff
    else {
      this.position.x += 1 + td;
    }
    
    // Check if alien is hit now if it hasn't been hit before
    if (!this.hit) {
      this.player.hit(this.position);
    }
    
    // Calculate when change direction and jumpdown to next row
    if (Math.ceil(this.position.x) >= width-20) {
      this.direction = 'left';
      this.position.y += 2*this.width;
      this.position.x = width-20 - td;
    }
    if (Math.ceil(this.position.x) <= 13) {
      this.direction = 'right';
      this.position.y += 2*this.width;
      this.position.x = 13 + td;
    }
  },
  
  // Checking if alien was hit by a laser-shoot
  alienHit: function(laserPos) {
    if (laserPos.x < this.position.x+this.width && laserPos.x > this.position.x-this.width && laserPos.y < this.position.y+this.width && laserPos.y > this.position.y-this.width) {
      if (this.hit == 0) {
        this.player.score += this.points;
        this.player.hits++;
        
        console.log('Alien hit - hit: ' + this.player.hits + ' | points: +' + this.points + ' | score: ' + this.player.score);
        
        this.hit = 1;
        
        return true;
      }
    }
    
    return false;
  }
}

/**
 * A Player as an object.
 */
 
function Player(width, height, position, canvasWidth, gameStatus, settings) {
  this.width       = width     || 32;           // Base width
  this.height      = height    || 32;           // Base height
  this.canvasWidth = canvasWidth;               // Canvas width
  this.position    = position  || new Vector(); // Base position
  this.lasers      = new Lasers(settings);      // Lasers object
  this.gameStatus  = gameStatus;                // GameStatus object
  this.settings    = settings;                  // Settings object
  this.coolDown    = 0;                         // Cool down for laser-cannon
  this.score       = 0;                         // Score count
  this.hits        = 0;                         // Hits count
  this.img         = new window.Image();        // Base image object
  this.img.src     = "img/space_invaders/base.png";
  this.hitImg      = new window.Image();        // Hit base image object
  this.hitImg.src  = "img/space_invaders/baseHit.png"
}

Player.prototype = {
  // Draw base, laser and score stats
  draw: function(ct) {
    ct.save();
    ct.translate(this.position.x, this.position.y);
    ct.beginPath();
    ct.drawImage(this.img, -16, -16, this.width, this.height);
    ct.stroke();
    ct.restore();
    this.drawScoreBoard(ct);
    this.lasers.draw(ct);
  },
  
  // Drawing score stats for player
  drawScoreBoard: function(ct){
    ct.save();
    ct.font = "25px impact";  
    ct.translate(0, 0);
    ct.fillStyle = 'white';
    ct.fillText(('0000' + this.score).slice(-5), this.canvasWidth - 75, 30);
    ct.fillText(('000' + this.hits).slice(-4), 10, 30);
    ct.restore();
  },    
  
  // Move base -2 pixels + timediff 
  moveLeft: function(td) {
    this.position.x -= 2 + td;
  },
  
  // Move base +2 pixels + timediff
  moveRight: function(td) {
    this.position.x += 2 + td;
  },
  
  // Fire laser-shot
  fire: function(td) {
    // If laser-cannon is not under cool down shot laser
    if (!this.coolDown || this.coolDown < 0) {
      this.lasers.fire(5, new Vector(this.position.x, this.position.y + td));
      this.coolDown = 30 - td; // Add a cool down on cannon for 30 frames
    }
  },

  update: function(td, width, height, aliens) {
    // Remove one frame + timediff from cooldown 
    if (this.coolDown && this.coolDown > 0) {
      this.coolDown -= 1 + td;
    }
    
    // Check if player keyboard commands
    if (window.Key.isDown(window.Key.RIGHT) || window.Key.isDown(window.Key.D)) this.moveRight(td);
    if (window.Key.isDown(window.Key.LEFT) || window.Key.isDown(window.Key.A))  this.moveLeft(td);
    if (window.Key.isDown(window.Key.FIRE))  this.fire(td);
    // Check so base still in visible area otherwish get base to last possible position in visible area in that direction
    this.stayInArea(width, height);
    // Update fired laser-shots
    this.lasers.update(td, aliens);
  },
  
  // Check so base still in visible area otherwish get base to last possible position in visible area in that direction
  stayInArea: function(width, height) {    
    if (this.position.x < 0)     this.position.x = 1;
    if (this.position.x > width) this.position.x = width -1;
  },
  
  // Check if base is hit, if it's set game over status on game and change base image object to hit image object
  hit: function(alienPos) {
    if (alienPos.x < this.position.x+this.width && alienPos.x > this.position.x-this.width &&  alienPos.y < this.position.y+this.height && alienPos.y > this.position.y-this.height) {
      this.img = this.hitImg;
      this.gameStatus.gameOver();
    }
  }
}

/**
 * Lasers as an object.
 */
 
function Lasers(settings) {
  this.lasers    = [];      // Laser-shots array
  this.settings = settings; // Settings object
}

Lasers.prototype = {
  
  // Fire laser
  fire: function(height, position) {
    if(this.settings.audio){
      $("#fire")[0].play();
    }
    
    // Make a new laser-shot and add it to laser-shots array
    this.lasers.push(new Laser(height, position, this.settings));
  },
  
  // Draw laser-shots
  draw: function(ct) {
    for (var i = 0; i < this.lasers.length; i++) {
      this.lasers[i].draw(ct);
    }
  },
  
  // Update laser-shots
  update: function(td, aliens) {
    var lasers = this.lasers;
    this.lasers = [];
    for (var i = 0; i < lasers.length; i++) {
      if (lasers[i].update(td, aliens)) {
        this.lasers.push(lasers[i]);
      }
    }
  }
}

/**
 * A Laser as an object.
 */
 
function Laser(height, position, settings) {
  this.height    = height    || 10;           // Laser-shot height
  this.position  = position  || new Vector(); // Laser-shot position
  this.settings  = settings;                  // Settings object
}

Laser.prototype = {
  // Draw laser-shot
  draw: function(ct) {
    ct.save();
    ct.translate(this.position.x, this.position.y);
    ct.fillStyle = '#ffffff';
    ct.fillRect(-1, -5, 2, 10);
    ct.restore();
  },
  
  // Update laser-shot
  update: function(td, aliens) {
    this.position.y -= 2 + td;
    // If laser-shot hit a alien play audio-effect and return false to do removal of shot
    if(aliens.hit(this.position)){
      if(this.settings.audio){
        $("#hit")[0].play();
      }
      
      return false;
    }
    // Otherwish check if it's still in visible area, return result as boolean
    else{
      return this.inArea();
    }
    
  },
  
  // Check if laser-shot still is visible, return result as boolean
  inArea: function() {
    if (this.position.y > 0) {
        return true;
    }
    return false;
  }
}

/**
 * Space Invander (the game)
 */
 
window.SpaceInvaders = (function(){
  var canvasId, canvas, ct, width, height, alienEnimes, settings, gameStatus, player, aliens, lastGameTick, maxLevel, cp;
  
  // Init game
  var init = function(canvasIndex, startStatus = 1) {
    canvasId        = canvasIndex;                                               // Canvas element index
    canvas          = document.getElementById(canvasId);                         // Canvas document-element
    ct              = canvas.getContext('2d');                                   // 2d-context
    width           = canvas.width;                                              // Canvas width
    height          = canvas.height;                                             // Canvas height
    alienEnimes     = 15;                                                        // This setting count of diffrent enimes, need to have images for all
    maxLevel        = parseInt((height-(height*0.1))/40 - 5);                    // Calculate max level by height on canvas
    maxLevel        = (maxLevel < alienEnimes - 3) ? maxLevel : alienEnimes - 3; // All levels need to have a image, so no max level over alien enimes count - three (first level got four)
    
    console.log("Max level: " + maxLevel);
    console.log("Game Status: " + startStatus);
    
    settings   = new Settings(); // Settings object
    gameStatus = new GameStatus(startStatus, maxLevel, settings); // GameStatus object
    player     = new Player(32, 32, new Vector(width/2, height*0.9), width, gameStatus, settings); // Player object
    aliens     = new Aliens(20, width, alienEnimes, player, gameStatus, settings); // Alien object
    
    // Add external controlpanel
    controlPanel();
    
    // Render game
    render();
    
    console.log('Init the game');
  };
  
  // Update game
  var update = function(td) {
    player.update(td, width, height, aliens);
    aliens.update(td, width, height);
  };
  
  // Render game
  var render = function() {
    ct.clearRect(0, 0, width, height);
    player.draw(ct);
    aliens.draw(ct);
  };
  
  // Add external controlpanel to game
  var controlPanel = function(){
    cp = $('<div id="si_cp"></div>');
    
    $('<button id="si_newGame" class="si_button">New game</button>')
    .addClass('si_button')
    .appendTo(cp)
    .click(restartGame);
    
    $('<button id="si_pause">Pause</button>')
    .attr('title', 'Pause game')
    .addClass('si_button')
    .appendTo(cp)
    .click(pauseGame);
    
    var audio_button = (settings.audio) ? "on" : "off";
    
    $('<button id="si_toggle_audio">Audio: <span>' + audio_button + '</span></button>')
    .attr('title', 'Turn on/off audio-effects')
    .addClass('si_button')
    .appendTo(cp)
    .click(setAudio);
    
    cp.hide().insertAfter(canvas);
  };
  
  // Set position to controlpanel and dialog button (if exist), for fix moving canvas
  var setPositionCpDialogBtn = function () {
    if(btn !== undefined){
      btn
      .show()
      .css({
        top:  ($(canvas).offset().top + ((height)/2) + 50),
        left: ($(canvas).offset().left + (width-btn.outerWidth())/2)
      });
    }
    cp.css('top', ($(canvas).offset().top + $(canvas).outerHeight() - cp.outerHeight())).show();
  };
  
  // Game loop for frame updates
  var gameLoop = function() {
    // Check for use of pause buttons, start button or restart button
    if (window.Key.isDown(window.Key.PAUSE) || window.Key.isDown(window.Key.P)) pauseGame();
    if (window.Key.isDown(window.Key.S) && gameStatus.status != 0){
      if(gameStatus.status < 3)       startGame();
      else if(gameStatus.status == 3) levelUp();
      else                            restartGame();
    }
    if (window.Key.isDown(window.Key.R)) restartGame();
    
    var now = Date.now();
    var td = (now - (lastGameTick || now)) / 1000; // Timediff since last frame / gametick
    lastGameTick = now;
    
    // Fix moving canvas, by set position for controlpanel and dialog btn (if exist) every frame
    setPositionCpDialogBtn();
    
    window.requestAnimFrame(gameLoop);
    
    // Check if game is stopped, if it's render message and add external button
    if (gameStatus.status > 0) {
      gameStop();
    }
    // Otherwish update and render game
    else {
      update(td);
      render();
    }
  };
  
  // Handle game stop, render message and add external button
  var gameStop = function() {
    // Never render message twice
    if(gameStatus.hasRender == 0){
      var txt;
      var btn = $('<button></button>');
      var btn_id;
      
      $(".si_dialog_btn").remove(); // If message render more than once remove button
      
      // Prepare message and button
      if (gameStatus.status == 4) { 
        btn_id = 'restart';
        
        txt = [
          {'txt': 'You WON!',               'color': 'rgb(35,234,131)'},
          {'txt': 'You finish last level.', 'color': 'rgb(35,234,131)'}
        ];
      }
      else if(gameStatus.status == 3) {
        btn_id = 'nextLevel';
        var nextLevel = gameStatus.level + 1;
        
        txt = [
          {'txt': 'Level up!',               'color': 'rgb(35,234,131)'},
          {'txt': 'New level #' + nextLevel, 'color': 'rgb(35,234,131)'}
        ];
      }
      else if(gameStatus.status == 1) {
        btn_id = 'start';
        
        txt = [
          {'txt': 'Welcome!',            'color': 'rgb(255,255,255)'},
          {'txt': 'Press start to play', 'color': 'rgb(255,255,255)'}
        ];
      }
      else if(gameStatus.status == 2) {
        btn_id = 'start';
        
        txt = [
          {'txt': 'Paused',              'color': 'rgb(255,255,255)'},
          {'txt': 'Press start to play', 'color': 'rgb(255,255,255)'}
        ];
      }
      else {
        btn_id = 'restart';
        
        txt = [
          {'txt': 'Game Over!',                           'color': 'rgb(234,35,88)'},
          {'txt': 'Click on restart game, to try agian.', 'color': 'rgb(234,35,88)'}
        ];
      }
      
      // Render message
      gameStatus.render(ct, width, height, txt);
      
      // Prepare button
      if(btn_id == 'restart'){
        btn
        .text("Restart game")
        .css('left', (width-29)/2)
        .click(restartGame);
      }
      else if(btn_id == 'start'){
        btn
        .attr('title', 'Start game')
        .text('Start')
        .click(startGame);
      }
      else{
        btn
        .attr('title', 'Continue to next level')
        .text("Continue")
        .click(levelUp);
      }
      
      // Prepare and add button
      btn
      .attr('id', 'si_' + btn_id)
      .addClass('si_button')
      .addClass('si_dialog_btn')
      .insertAfter(cp)
      .focus();
    }
  };
  
  // Handle click for level up
  var levelUp = function(){
    if(maxLevel > gameStatus.level){
      gameStatus.levelUp();
      aliens.init();
      gameStatus.setStatus(0);
      gameStatus.removeHasRender();
      $("#si_nextLevel").remove();
      console.log('Continue to next level: ' + gameStatus.level);
    }
  };
  
  // Handle click for start game 
  var startGame = function(){
    gameStatus.setStatus(0);
    gameStatus.removeHasRender();
    $('#si_start').remove();
    $('#si_pause').show(0);
    console.log('Game started!');
  };
  
  // Handle click for restart game
  var restartGame = function(){
    $(".si_button").remove();
    $(cp).remove();
    init(canvasId, 0);
    $('#si_pause').show(0);
  }
  
  // Handle click for pause game
  var pauseGame = function(){
    gameStatus.setStatus(2);
    $("#si_pause").hide(0);
    console.log('Game pause!');
  };
  
  // Handle click for turn on or off audio effects
  var setAudio = function(){
    var btn_txt_elm = $(this).find("span");
    var btn_txt = "off";
    
    if(btn_txt_elm.text() == 'off'){
      settings.setAudio(true);
      btn_txt = 'on';
    }
    else{
      settings.setAudio(false);
    }
    
    btn_txt_elm.text(btn_txt);
    console.log('Audio is set ' + btn_txt);
    
    $(this).blur();
  };
  
  return {
    'init': init,
    'gameLoop': gameLoop,
    'setAudio': setAudio
  };
})();


$(function(){
  'use strict';

  window.SpaceInvaders.init('spaceinvaders');
  window.SpaceInvaders.gameLoop();

  console.log('Ready to play.');
});