window.onload = init;

//canvas map
var map, ctxMap;
var mapWidth = 900,
  mapHeight = 500;

//canvas player
var pl, ctxPl;
var player; // player

//canvas collisions
var collis, ctxCollis;
var offS, ctxOffS;

//canvas trees
var trees, ctxTrees;
var tree,
  treeArr = [],
  treeOffArr = [];

var isPlaying;

// canvas interface
var ui, ctxUi;

//background
var bgImg = new Image();
bgImg.src = 'img/backgr.jpg';

var playgroundW = 1500;
var playgroundH = 1500;

var mapX, mapY;

//Player sheet
var sprites = new Image();
sprites.src = 'img/SpriteSheet.png'

//Trees sheet
var treeSprites = new Image();
treeSprites.src = 'img/TreesSheet.png';

//Inventory sheet
var invSprites = new Image();
invSprites.src = 'img/inventory.png';
//Loot sheet
var lootSprites = new Image();
lootSprites.src = 'img/loot.png';

var lt, ctxLoot;
var invArr = []; // inventory arr
var lootArr = []; // loot arr
var droppedLootArr = []; // dropped loot arr
var droppedLootOffsArr = []; // dropped offset loot arr

// loop
var reqAnimFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame;


var droppingLoot;
//----------------------------------

function init() {
  droppingLoot = {
    name: '',
    check: true,
    x: 0,
    y: 0,
    lngth: 0,
  }

  invArr = [
    {
      name: 'Axe',
      sprite: invSprites,
      x: 20,
      y: 0
    }
  ];

  lootArr = [
    {
      name: 'Wood',
      sprite: lootSprites,
      x: 0,
      y: 0,
    }
     ];

  // init
  map = document.getElementById('map'); // map
  ctxMap = map.getContext('2d');

  pl = document.getElementById('player'); // player
  ctxPl = pl.getContext('2d');

  trees = document.getElementById('trees'); // trees
  ctxTrees = trees.getContext('2d');

  collis = document.getElementById('collisions'); // collisions
  ctxCollis = collis.getContext('2d');

  offS = document.getElementById('offset'); // offset
  ctxOffS = offS.getContext('2d');

  ui = document.getElementById('ui'); // interface
  ctxUi = ui.getContext('2d');

  lt = document.getElementById('loot'); // loot
  ctxLoot = lt.getContext('2d');

  // sizes
  map.width = mapWidth;
  map.height = mapHeight;
  pl.width = mapWidth;
  pl.height = mapHeight;
  trees.width = mapWidth;
  trees.height = mapHeight;
  collis.width = mapWidth;
  collis.height = mapHeight;
  offS.width = mapWidth;
  offS.height = mapHeight;
  ui.width = mapWidth;
  ui.height = mapHeight;
  lt.width = mapWidth;
  lt.height = mapHeight;

  player = new Player();
  tree = new Tree();
  ui = new UInterface();

  startLoop();
  spawnTrees(100);
  drawBg();

  document.onkeydown = checkKeyDown;
  document.onkeyup = checkKeyUp;
}

//----------------------------------


// Loop
function loop() {
  if (isPlaying) {
    draw();
    update();
    reqAnimFrame(loop);
  }
}

function startLoop() {
  isPlaying = true;
  loop();
}

function stopLoop() {
  isPlaying = false;
}


//Updating functions 
function update() {
  player.update();
  for (i = 0; i < treeArr.length; i++) {
    treeArr[i].update();
    treeOffArr[i].update();
  }
  for (i = 0; i < droppedLootArr.length; i++) {
    droppedLootArr[i].update();
  }
  moveWorld();

  if (droppingLoot.check && droppingLoot.x != 0 && droppingLoot.y != 0) {
    dropLoot();
  }



}

// Drawning functions
function draw() {
  player.draw();
  ui.draw();
  clearCtxTrees();
  offsetClear();
  for (i = 0; i < treeArr.length; i++) {
    treeArr[i].draw('tree');
    treeOffArr[i].draw('offset');
  }
  clearCtxLoot();
  if (droppedLootArr.length > 0) {
    for (i = 0; i < droppedLootArr.length; i++) {
      droppedLootArr[i].draw('front');
      droppedLootOffsArr[i].draw('back');
    }
  }
}

function drawBg(a, b) {
  var aa = a || 0,
    bb = b || 0;
  mapX = aa;
  mapY = bb;
  ctxMap.clearRect(0, 0, playgroundW, playgroundH);
  ctxMap.drawImage(bgImg, 0, 0, 1500, 1500, aa, bb, playgroundW, playgroundH);

}


function clearCtxPlayer() {
  ctxPl.clearRect(0, 0, mapWidth, mapHeight);
}

function clearCtxTrees() {
  ctxTrees.clearRect(0, 0, mapWidth, mapHeight);
  ctxOffS.clearRect(0, 0, mapWidth, mapHeight);
}

function clearCtxUi() {
  ctxUi.clearRect(0, 0, mapWidth, mapHeight);
}

// Objects

// Player obj
function Player() {
  this.srcX = 0;
  this.srcY = 0;
  this.posX = 100;
  this.posY = 100;
  this.width = 32;
  this.height = 32;
  this.centerX = this.posX + this.width / 2;
  this.centerY = this.posY + 34;

  //params
  this.speed = 3;
  this.health = 100;
  this.strength = 100;
  this.inventory = [
    {
      id: 1,
      checked: false,
      name: 'Axe',
      type: 'tool',
      sprite: invSprites,
      x: 0,
      y: 0,
      pos: 35,
      strength: 20,
      attack: 0.5
    }
  ];

  // keys
  this.isUp = false;
  this.isRight = false;
  this.isDown = false;
  this.isLeft = false;

  this.dir = 'right';
  this.isMove = false;
}
// Trees obj
function Tree(id, arg, x, y) {
  var sprSrc;
  if (arg == 'back') sprSrc = -50;
  if (arg == 'front') {
    sprSrc = 0;
    this.loot = Math.floor(Math.random() * 10) + 1;
    this.strength = 20;
  }
  this.layer = arg;
  this.id = id;
  this.srcX = 32;
  this.srcY = sprSrc;
  this.posX = x;
  this.posY = y;
  //  this.posX = Math.floor(Math.random() * playgroundW) + 200;
  //  this.posY = Math.floor(Math.random() * playgroundH) + 200;
  this.width = 32;
  this.height = 64;
  this.centerX = this.posX + this.width / 2;
  this.centerY = this.posY + 50;

  this.isCollis = false;
  // params
}

function UInterface() {
  this.health = player.health;
  this.strength = player.strength;

}



//******************



function Loot(obj, x, y, lng) {
  this.name = obj.name;
  this.img = obj.sprite;
  this.srcX = obj.x;
  this.srcY = obj.y;
  this.posX = x;
  this.posY = y;
  this.width = 25;
  this.height = 25;
  this.amount = lng;
}

Loot.prototype.draw = function (arg) {
  var srcx = this.srcX,
    srcy = this.srcY;
  if (this.amount > 1) {
    srcx = 32;
    ctxUi.font = 'normal 10px Arial';
    ctxUi.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctxUi.fillRect(this.posX + 10, this.posY + 30, 15, 15);
    ctxUi.fillStyle = '#fff';
    ctxUi.textAlign = 'center';
    ctxUi.fillText(this.amount, this.posX + 17, this.posY + 41, 20, 20);
    ctxUi.textAlign = 'left';
  }
  if (arg == 'front') {
    ctxLoot.drawImage(this.img, srcx, srcy, 32, 32, this.posX + 5, this.posY + 42, this.width, this.height);

  } else {
    ctxOffS.drawImage(this.img, srcx, srcy, 32, 32, this.posX + 5, this.posY + 42, this.width, this.height);
  }
}

Loot.prototype.update = function () {
  var lootaaa = droppedLootOffsArr.find((arg) => {
    return arg.posX == this.posX && arg.posY == this.posY;
  });
  // слои
  if (player.posY > this.posY + 32) {
    this.srcY = -50;
    lootaaa.srcY = 0;
  } else {
    lootaaa.srcY = -50;
    this.srcY = 0;
  }

  var posV = vector(player, this, 5, 36);
  if (posV < 15) {
    var idNxt = player.inventory.length;
    var poss = player.inventory[idNxt - 1].pos;
    var item = player.inventory.find((itm) => {
      return itm.name == this.name;
    });
    if (item == undefined) {
      player.inventory.push({
        id: idNxt + 1,
        checked: false,
        name: this.name,
        type: 'loot',
        sprite: lootSprites,
        x: 0,
        y: 32,
        pos: poss + 25,
        amount: this.amount
      });
    } else {
      item.amount += this.amount;
    }
    this.destroy();

  }
}
Loot.prototype.destroy = function () {

  for (a = 0; a < droppedLootOffsArr.length; a++) {
    if (this.posX == droppedLootOffsArr[a].posX && this.posY == droppedLootOffsArr[a].posY) {
      droppedLootArr.splice(droppedLootArr.indexOf(this), 1);
      droppedLootOffsArr.splice(droppedLootOffsArr.indexOf(droppedLootOffsArr[a]), 1);
    }
  }

}

function vector(first, second, x, y) {
  x = x || 0;
  y = y || 0;
  var first_cX = first.posX + first.width / 2,
    first_cY = first.posY + first.height / 2;
  var second_cX = (second.posX + second.width / 2) + x,
    second_cY = (second.posY + second.height / 2) + y;

  var pointsX = first_cX - second_cX;
  var pointsY = first_cY - second_cY;

  //  ctxLoot.beginPath();
  //  ctxLoot.moveTo(first_cX, first_cY);
  //  ctxLoot.lineTo(second_cX, second_cY);
  //  ctxLoot.closePath();
  //  ctxLoot.stroke();

  var quadX = pointsX * pointsX;
  var quadY = pointsY * pointsY;

  return Math.sqrt(quadX + quadY);
}


function lootMoves(x, y) {
  x = x || 0;
  y = y || 0;

  for (i = 0; i < droppedLootArr.length; i++) {
    droppedLootArr[i].posX += x;
    droppedLootArr[i].posY += y;
    droppedLootOffsArr[i].posX += x;
    droppedLootOffsArr[i].posY += y;
  }
}

function clearCtxLoot() {
  ctxLoot.clearRect(0, 0, mapWidth, mapHeight);
}

//*********************


UInterface.prototype.draw = function () {
  ctxUi.font = 'bold 8px Arial';

  clearCtxUi();

  // health
  ctxUi.fillStyle = 'red';
  ctxUi.fillRect(10, 10, this.health, 15);
  ctxUi.strokeStyle = '#2e2e2e';
  ctxUi.strokeRect(10, 10, 100, 15);

  // strength
  ctxUi.fillStyle = 'green';
  ctxUi.fillRect(120, 10, this.strength, 15);
  ctxUi.strokeRect(120, 10, 100, 15);
  iventoryUIDraw();
}

function iventoryUIDraw() {
  for (a = 0; a < player.inventory.length; a++) {
    var checked = player.inventory[a].checked;
    if (checked) {
      ctxUi.strokeStyle = '#fff';
      ctxUi.fillStyle = '#fff';
      ctxUi.fillText(player.inventory[a].name, 34, player.inventory[a].pos + 13);
      var strength = player.inventory[a].strength,
        width = strength;
      if (strength != undefined) {
        if (strength >= 1) {
          if (strength < 5) {
            ctxUi.fillStyle = '#ff3100';
          } else if (strength < 10) {
            ctxUi.fillStyle = '#e6cc00';
          } else if (strength <= 15) {
            ctxUi.fillStyle = '#af9b00';
          } else if (strength <= 20) {
            ctxUi.fillStyle = '#008d00';
          }
          ctxUi.fillRect(2, player.inventory[a].pos, 5, strength);
        } else {
          ctxUi.fillRect(2, player.inventory[a].pos, 5, 0);
        }
      }
    } else ctxUi.strokeStyle = '#2e2e2e';
    ctxUi.fillStyle = 'rgba(149, 149, 149, 0.3)';
    ctxUi.fillRect(10, player.inventory[a].pos, 20, 20);
    ctxUi.strokeRect(10, player.inventory[a].pos, 20, 20);
    ctxUi.drawImage(player.inventory[a].sprite, player.inventory[a].x, player.inventory[a].y, 20, 20, 10, player.inventory[a].pos, 20, 20);
    ctxUi.fillStyle = '#fff';
    ctxUi.fillText(a + 1, 13, player.inventory[a].pos + 17);
    if (player.inventory[a].amount != undefined) {
      var amm = player.inventory[a].amount;
      var width = 12,
        start = 17;
      if (amm >= 10) width = 16, start = 13;
      ctxUi.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctxUi.fillRect(start, player.inventory[a].pos + 1, width, 8);

      ctxUi.fillStyle = '#000';
      ctxUi.fillText('x' + amm, start + 2, player.inventory[a].pos + 8);
    }
  }

}


// Objects features
// spawn player

Player.prototype.draw = function () {
  clearCtxPlayer();
  ctxPl.drawImage(sprites,
    this.srcX, this.srcY, this.width, this.height,
    this.posX, this.posY, this.width, this.height);
  for (i = 0; i < this.inventory.length; i++) {
    var inv = this.inventory[i];
    if (inv.checked) {
      invDraw(inv.name);
    }
  }
}
// draw inventory
function invDraw(name) {
  for (i = 0; i < invArr.length; i++) {
    if (invArr[i].name == name) {
      var sprite, x, y, pX; // vars for direction
      sprite = invArr[i].sprite;
      y = invArr[i].y;
      if (player.dir == 'right') {
        x = invArr[i].x;
        pX = player.posX + 6;
      }
      if (player.dir == 'left') {
        x = invArr[i].x + 20;
        pX = player.posX + 10;
      }
      if (player.dir == 'down') {
        x = invArr[i].x + 40;
        pX = player.posX + 2;
      }
      if (player.dir == 'up') {
        x = invArr[i].x + 60;
        pX = player.posX + 13;
      }
      ctxPl.drawImage(sprite,
        x, y, 20, 20,
        pX, player.posY + 10, 18, 18);
    }
  }
}

//move player

Player.prototype.chooseDir = function () {
  if (this.isUp) {
    this.posY -= this.speed;
    this.srcY = 64;
    this.dir = 'up';
  }
  if (this.isRight) {
    this.posX += this.speed;
    this.srcY = 0;
    this.dir = 'right';
  }
  if (this.isDown) {
    this.posY += this.speed;
    this.srcY = 96;
    this.dir = 'down';
  }
  if (this.isLeft) {
    this.posX -= this.speed;
    this.srcY = 32;
    this.dir = 'left';
  }
}
Player.prototype.invChoose = function (id) {
  for (a = 0; a < this.inventory.length; a++) {
    if (this.inventory[a].id == id) {
      if (this.inventory[a].checked != true) {
        this.inventory[a].checked = true;
      } else this.inventory[a].checked = false;
    } else this.inventory[a].checked = false;
  }
}


// trees

Tree.prototype.draw = function (arg) {
  if (arg == 'tree') {
    ctxTrees.drawImage(treeSprites,
      this.srcX, this.srcY, this.width, this.height,
      this.posX, this.posY, this.width, this.height);
  }
  if (arg == 'offset') {
    ctxOffS.drawImage(treeSprites,
      this.srcX, this.srcY, this.width, this.height,
      this.posX, this.posY, this.width, this.height);
  }
}


Tree.prototype.update = function () {
  var secnd = treeOffArr.find((arg) => {
    return arg.id == this.id;
  });

  isCollision(this, secnd, 62);
  isCollision2(player, this, 10, 10, 10, 10);
}



function spawnTrees(count) {
  for (i = 0; i < count; i++) {
    var xx = Math.floor(Math.random() * playgroundW) + 200;
    var yy = Math.floor(Math.random() * playgroundH) + 200;
    treeArr[i] = new Tree(i, 'front', xx, yy);
    treeOffArr[i] = new Tree(i, 'back', xx, yy);
  }
}



function treeMoves(x, y) {
  x = x || 0;
  y = y || 0;

  for (i = 0; i < treeArr.length; i++) {
    treeArr[i].posX += x;
    treeArr[i].posY += y;
    treeOffArr[i].posX += x;
    treeOffArr[i].posY += y;
  }
}

//offset


function offsetClear(x, y, w, h) {
  x = x || 0;
  y = y || 0;
  w = w || mapWidth;
  h = h || mapHeight;

  ctxOffS.clearRect(x, y, w, h);
}

// check collisions
function isCollision(obj2, obj3, val) {


  if (player.posY + player.height > obj2.posY + val && player.posY < obj2.posY + obj2.height) {
    obj2.srcY = -50;
    obj3.srcY = 0;
  } else {
    obj2.srcY = 0;
    obj3.srcY = -50;
  }
}

function isCollision2(player, obj2, l, r, t, b) {
  var l = l || 0,
    r = r || 0,
    t = t || 0,
    b = b || 0;

  if (obj2.layer == 'front' && player.posX + player.width >= obj2.posX - l && player.posX <= obj2.posX + obj2.width + r && player.posY + player.height > obj2.posY + 62 - t && player.posY < obj2.posY + obj2.height - b) {
    var centerX = obj2.posX + obj2.width / 2;
    var centerY = obj2.posY + obj2.height / 2;
    var invent = player.inventory.find((arg) => {
      return arg.checked == true;
    });
    if (invent != undefined) {
      if (invent.name == 'Axe') {
        obj2.isCollis = true;
        ctxUi.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctxUi.fillRect(centerX - 4, centerY - 40, 15, 15);
        ctxUi.font = 'bold 12px Arial';
        ctxUi.fillStyle = '#000';
        ctxUi.fillText('E', centerX - 1, centerY - 28, 15, 15);
      } else {
        obj2.isCollis = false;
      }
    }
  } else {
    obj2.isCollis = false;
  }
}

// Other
var xx = 0;
var yy = 0;

function moveWorld() {
  if (player.isUp) {
    if (player.posY < 25) {
      player.posY = 24;
      if (yy < 1) {
        drawBg('', yy);
        treeMoves('', player.speed);
        lootMoves('', player.speed);
        yy += player.speed;
      }
    }
  }
  if (player.isRight) {
    if (player.posX + player.width > 870) {
      player.posX = 871 - player.width;
      if (xx > -590) {
        drawBg(xx);
        treeMoves(-player.speed);
        lootMoves(-player.speed);
        xx -= player.speed;
      }
    }
  }
  if (player.isDown) {
    if (player.posY > 465 - player.height) {
      player.posY = 464 - player.height;
      if (yy > -980) {
        drawBg('', yy);
        treeMoves('', -player.speed);
        lootMoves('', -player.speed);
        yy -= player.speed;
      }
    }
  }
  if (player.isLeft) {
    if (player.posX < 30) {
      player.posX = 29;
      if (xx < 1) {
        drawBg(xx);
        treeMoves(player.speed);
        lootMoves(player.speed);
        xx += player.speed;
      }
    }
  }
}

// Update player 
Player.prototype.update = function () {
  this.chooseDir();
}

// KEY DOWN
function checkKeyDown(e) {
  var keyId = e.keyCode || e.which;
  var keyChar = String.fromCharCode(keyId);

  if (keyChar == 0) {
    var canv = document.getElementsByTagName('canvas');
    console.log(canv);
    for (i = 0; i < canv.length; i++) {
      if (canv[i].id != 'map') {
        canv[i].style.marginTop = -704+'px';
      }
      canv[i].webkitRequestFullScreen();
    }
    mapHeight = window.innerHeight;
    mapWidth = window.innerWidth;
    init();

  }

  // position
  if (keyChar == 'W') {
    player.isUp = true;
    player.isMove = true;
    e.preventDefault();
  } else if (keyChar == 'D') {
    player.isRight = true;
    player.isMove = true;
    e.preventDefault();
  } else if (keyChar == 'S') {
    player.isDown = true;
    player.isMove = true;
    e.preventDefault();
  } else if (keyChar == 'A') {
    player.isLeft = true;
    player.isMove = true;
    e.preventDefault();
  }

  // inventory
  if (keyChar == 1 || keyChar == 2 || keyChar == 3 || keyChar == 4 || keyChar == 5 || keyChar == 6 || keyChar == 7) {
    player.invChoose(keyChar);
  }

  if (player.isMove == false) {
    if (keyChar == 'E') {
      var tree = treeArr.find((tree) => {
        return tree.isCollis == true;
      });
      var axe = player.inventory.find((inv) => {
        return inv.checked == true && inv.name == 'Axe';
      });
      if (tree != undefined && axe != undefined) {
        var pl = player.posX + player.width;

        ctxCollis.clearRect(0, 0, mapWidth, mapHeight);
        showHealthTree(tree);

        if (tree.strength != 0) {

          if (pl >= tree.posX && pl <= tree.posX + (tree.width / 2) + 20) {
            player.posX = tree.posX - 15;
            player.posY = tree.posY + tree.height / 2;
            player.srcY = 0;
            tree.strength -= axe.attack;
          } else {
            player.posX = tree.posX + tree.width - 15;
            player.posY = tree.posY + tree.height / 2;
            player.srcY = 32;
            tree.strength -= axe.attack;
          }
        } else {
          treeDestroy(tree);
          hideHealthTree();
        }

      }
    }
  } else hideHealthTree();
}

function showHealthTree(tr) {
  if (tr.layer == 'front') {
    var centerX = tr.posX + tr.width / 2;
    var centerY = tr.posY + tr.height / 2;

    var strength = (tr.strength / 100) * 33;
    ctxCollis.beginPath();
    ctxCollis.lineWidth = 4;
    ctxCollis.strokeStyle = 'rgba(0, 128, 0, 0.8)';
    ctxCollis.arc(centerX + 3, centerY - 32, 15, 0, strength, false);
    ctxCollis.stroke();

    ctxCollis.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctxCollis.fillRect(centerX - 4, centerY - 40, 15, 15);
  }
}

function hideHealthTree() {
  ctxCollis.clearRect(0, 0, mapWidth, mapHeight);
}

function treeDestroy(tr) {
  droppingLoot.name = 'Wood';
  droppingLoot.check = true;
  droppingLoot.x = tr.posX;
  droppingLoot.y = tr.posY;
  droppingLoot.lngth = tr.loot;

  for (a = 0; a < treeArr.length; a++) {
    if (treeArr[a].id == tr.id && treeOffArr[a].id == tr.id) {
      treeArr.splice(treeArr.indexOf(treeArr[a]), 1);
      treeOffArr.splice(treeOffArr.indexOf(treeOffArr[a]), 1);
    }
  }
}

function dropLoot() {
  if (droppingLoot.name != '') {
    var nameLoot = droppingLoot.name;
    var lng = droppingLoot.lngth;
    var dLoot = lootArr.find((arg) => {
      return arg.name == nameLoot;
    });
    if (dLoot != undefined) {
      droppedLootArr.push(new Loot(dLoot, droppingLoot.x, droppingLoot.y, droppingLoot.lngth));
      droppedLootOffsArr.push(new Loot(dLoot, droppingLoot.x, droppingLoot.y, droppingLoot.lngth));
    } else console.error('"dLoot" не найден!');

    droppingLoot.name = '';
    droppingLoot.check = false;
    droppingLoot.x = 0;
    droppingLoot.y = 0;
    droppingLoot.lngth = 0;
  } else console.error('"Loot.name" не найден!');
}

//KEY UP
function checkKeyUp(e) {
  var keyId = e.keyCode || e.which;
  var keyChar = String.fromCharCode(keyId);

  if (keyChar == 'W') {
    player.isUp = false;
    player.isMove = false;
    e.preventDefault();
  } else if (keyChar == 'D') {
    player.isRight = false;
    player.isMove = false;
    e.preventDefault();
  } else if (keyChar == 'S') {
    player.isDown = false;
    player.isMove = false;
    e.preventDefault();
  } else if (keyChar == 'A') {
    player.isLeft = false;
    player.isMove = false;
    e.preventDefault();
  }

  if (keyChar == 'E') hideHealthTree();
}
