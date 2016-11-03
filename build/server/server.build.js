(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./build/server/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var express = __webpack_require__(2);
	var app = express();
	var router = express.Router();
	
	var server = __webpack_require__(3).Server(app);
	var io = __webpack_require__(4)(server);
	
	app.use(express.static('./build/client'));
	
	app.use(__webpack_require__(5)(io));
	
	app.get('/', function (req, res) {
	    res.sendfile('./build/client/index.html');
	});
	
	server.listen(8080);

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("socket.io");

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__filename) {'use strict';
	
	var _game = __webpack_require__(6);
	
	var _game2 = _interopRequireDefault(_game);
	
	var _cards = __webpack_require__(9);
	
	var _cards2 = _interopRequireDefault(_cards);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var express = __webpack_require__(2);
	var Guid = __webpack_require__(10);
	var fs = __webpack_require__(11);
	var path = __webpack_require__(12);
	
	var Cards = typeof _cards2.default === "string" ? JSON.parse(fs.readFileSync(_cards2.default, 'utf8')) : _cards2.default;
	
	var pairs = 8;
	
	var getRandomCards = function getRandomCards() {
	  Cards.sort(function (a, b) {
	    return 0.5 - Math.random();
	  });
	
	  var cardsToUse = [];
	
	  //select cards
	  for (var i = 0; i < pairs * 2; ++i) {
	    var card = Cards[Math.floor(i / 2)];
	    cardsToUse.push({
	      name: card.name,
	      src: card.src
	    });
	  }
	
	  //randomize selected cards
	  cardsToUse.sort(function (a, b) {
	    return 0.5 - Math.random();
	  });
	
	  return cardsToUse;
	};
	
	var tryStartGame = function tryStartGame(game) {
	  var startGameInterval = setInterval(function () {
	    console.log('Trying to start a new game...');
	
	    if (game.players.length < 1) {
	      console.log('error', 'Minimum of 1 players needed to start a game!');
	      return;
	    }
	
	    game.newGame();
	    console.log('Game started!');
	    clearTimeout(startGameInterval);
	    startGameInterval = null;
	  }, 2000);
	};
	
	var memoryGame = function memoryGame(io) {
	  var router = express.Router();
	  var game = new _game2.default();
	  game.setCards(getRandomCards());
	
	  //game.on('status', status => console.log('GAME_STATUS', status));
	  game.on('error', function (error) {
	    return console.log('GAME_ERROR', error);
	  });
	  game.on('addPlayer', function (player) {
	    return io.emit('addPlayer', player);
	  });
	  game.on('removePlayer', function (guid) {
	    return io.emit('removePlayer', guid);
	  });
	  game.on('updatePlayer', function (player) {
	    return io.emit('updatePlayer', player);
	  });
	  game.on('newGame', function () {
	    return io.emit('newGame');
	  });
	  game.on('resetGame', function () {
	    return io.emit('resetGame');
	  });
	  game.on('setCards', function () {
	    return io.emit('setCards', game.getState().cards);
	  });
	  game.on('flipCard', function (guid, index) {
	    var card = game.getCard(index);
	
	    //make client aware of card contents
	    io.emit('updateCard', {
	      index: card.index,
	      name: card.name,
	      src: card.src
	    });
	
	    //flip card on client
	    console.log('FlipCard', { guid: guid, index: card.index });
	    io.emit('flipCard', { guid: guid, index: card.index });
	  });
	
	  //game.on('wait', text => io.emit('status', text));
	
	  game.on('gameFinished', function (player) {
	    console.log('Game finished!');
	    //io.emit('status', 'Game finished, will try to start a new game in 10 seconds');
	    //setTimeout(() => tryStartGame(game), 1000*10);
	  });
	
	  io.on('connection', function (socket) {
	    console.log('a user connected');
	    socket.emit('status', 'Connected!');
	
	    socket.on('flipCard', function (index) {
	      if (!socket.player) {
	        return;
	      }
	
	      console.log('Player tried to flip card', index);
	      var player = socket.player;
	      game.flipCard(player.guid, index);
	    });
	
	    socket.on('requestNewGame', function (cardsSearchString) {
	      console.log('Got New Game request');
	      game.setCards(getRandomCards());
	      game.newGame();
	    });
	
	    socket.on('requestResetGame', function () {
	      console.log('Got Reset Game request');
	      game.resetGame();
	    });
	
	    socket.on('disconnect', function () {
	      if (socket.player) {
	        (function () {
	          var guid = socket.player.guid;
	          socket.player.timeout = setTimeout(function () {
	            //delete a player after being disconnected for 10 seconds
	            console.log('10 seconds have passed so we will remove player!');
	            game.removePlayer(guid);
	          }, 1000 * 10);
	        })();
	      }
	    });
	
	    socket.on('auth', function (player) {
	      if (!player) {
	        return socket.emit('game_error', 'You need to send some player data!');
	      }
	
	      var name = player.name;
	      var guid = player.guid;
	
	      if (player.guid) {
	        var existingPlayer = game.getPlayer(player.guid);
	        if (existingPlayer) {
	          if (existingPlayer.timeout) {
	            clearTimeout(existingPlayer.timeout);
	          }
	          existingPlayer.socket.player = null;
	          existingPlayer.socket.disconnect();
	          player = existingPlayer;
	        } else {
	          //socket.emit('game_error', 'Couldnt find player with GUID: ' + guid);
	          player.guid = Guid.raw();
	          player = game.addPlayer(player); //Add new player
	        }
	      } else {
	        player.guid = Guid.raw();
	        player = game.addPlayer(player);
	      }
	
	      socket.player = player;
	      player.socket = socket;
	
	      socket.emit('authSuccess', player.getInfo());
	      socket.emit('gameState', game.getState());
	      console.log('Auth', name, guid);
	    });
	  });
	
	  //will loop until conditions for game is right and is started
	  //tryStartGame(game);
	
	  /*
	    Serve images for our game
	  */
	  router.get('/images/:image', function (req, res, next) {
	    //console.log(path.resolve(__dirname, '../images'), __dirname, path.join(__dirname, '../images', req.params.image));
	    var images = path.join(path.dirname(fs.realpathSync(__filename)), '../images');
	    res.sendFile(req.params.image, { root: images });
	  });
	
	  return router;
	};
	
	module.exports = memoryGame;
	/* WEBPACK VAR INJECTION */}.call(exports, "src\\server\\memory-game.js"))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _es6EventEmitter = __webpack_require__(7);
	
	var _es6EventEmitter2 = _interopRequireDefault(_es6EventEmitter);
	
	var _player = __webpack_require__(8);
	
	var _player2 = _interopRequireDefault(_player);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Game = function (_EventEmitter) {
	  _inherits(Game, _EventEmitter);
	
	  function Game() {
	    _classCallCheck(this, Game);
	
	    var _this = _possibleConstructorReturn(this, (Game.__proto__ || Object.getPrototypeOf(Game)).call(this));
	
	    _this.players = [];
	    _this.cards = [];
	
	    _this.currentTurn = null;
	    _this.firstCard = null;
	    _this.secondCard = null;
	    return _this;
	  }
	
	  _createClass(Game, [{
	    key: 'newGame',
	    value: function newGame() {
	      this.resetGame();
	      this.started = true;
	      this.trigger('newGame');
	      this.pickNextPlayer();
	    }
	  }, {
	    key: 'resetGame',
	    value: function resetGame() {
	      this.players.forEach(function (player) {
	        return player.pairs = 0;
	      });
	      this.cards.forEach(function (card) {
	        card.found = false;
	        card.flipped = false;
	      });
	
	      this.started = false;
	      this.currentTurn = null;
	      this.firstCard = null;
	      this.secondCard = null;
	
	      if (this.nextTurnInterval) {
	        console.log('Removing interval!');
	        clearInterval(this.nextTurnInterval);
	        this.nextTurnInterval = null;
	      }
	
	      if (this.pickNextPlayerTimeout) {
	        clearTimeout(this.pickNextPlayerTimeout);
	        this.pickNextPlayerTimeout = null;
	      }
	
	      this.trigger('status', 'Game Reset!');
	      this.trigger('resetGame');
	    }
	  }, {
	    key: 'setCards',
	    value: function setCards(cards) {
	      var _this2 = this;
	
	      this.cards = [];
	      cards.forEach(function (card, i) {
	        _this2.cards.push({
	          index: i,
	          name: card.name,
	          src: card.src,
	          flipped: card.flipped || false,
	          found: card.found
	        });
	      });
	      this.trigger('setCards', cards);
	    }
	  }, {
	    key: 'updateCard',
	    value: function updateCard(newCard) {
	      var card = this.cards.find(function (card) {
	        return newCard.index === card.index;
	      });
	
	      Object.assign(card, newCard);
	      this.trigger('updateCard', newCard);
	    }
	  }, {
	    key: 'getCard',
	    value: function getCard(index) {
	      return this.cards[index];
	    }
	  }, {
	    key: 'updateCards',
	    value: function updateCards(cards) {
	      var _this3 = this;
	
	      cards.forEach(function (card) {
	        _this3.updateCard(card);
	      });
	    }
	  }, {
	    key: 'getPairsLeft',
	    value: function getPairsLeft() {
	      var pairsLeft = this.cards.length;
	      this.cards.forEach(function (card) {
	        if (card.found) {
	          pairsLeft--;
	        }
	      });
	      pairsLeft /= 2;
	      return pairsLeft;
	    }
	  }, {
	    key: 'getLeadingPlayerGuid',
	    value: function getLeadingPlayerGuid() {
	      return this.players.concat().sort(function (a, b) {
	        return a.pairs < b.pairs;
	      })[0].guid;
	    }
	  }, {
	    key: 'flipCard',
	    value: function flipCard(guid, index) {
	      var _this4 = this;
	
	      var player = this.getPlayer(guid);
	
	      if (!player) {
	        this.trigger('error', 'Player who tried to flip card doesnt exist!');
	        return;
	      }
	
	      if (this.currentTurn != guid) {
	        this.trigger('error', 'player tried to flip card without it being their turn!');
	        return;
	      }
	
	      var card = this.cards[index];
	
	      if (!card) {
	        this.trigger('error', 'Card doesnt exist!');
	        return;
	      }
	
	      if (card.flipped) {
	        this.trigger('error', 'player tried to flip card thats already flipped!');
	        return;
	      }
	
	      if (card.found) {
	        this.trigger('error', 'player tried to flip card thats already found!');
	        return;
	      }
	
	      if (this.firstCard !== null && this.secondCard !== null) {
	        this.trigger('error', 'This player already picked 2 cards!');
	        return;
	      }
	
	      if (this.firstCard === null) {
	        this.firstCard = card.index;
	        card.flipped = true;
	      } else if (this.secondCard === null) {
	        this.secondCard = card.index;
	        card.flipped = true;
	      }
	
	      console.log('FlipCard', this.firstCard, this.secondCard);
	
	      if (this.firstCard !== null && this.secondCard !== null) {
	        var firstCard = this.getCard(this.firstCard),
	            secondCard = this.getCard(this.secondCard);
	
	        if (firstCard.name && firstCard.name === secondCard.name) {
	          //player scored
	          firstCard.found = true;
	          secondCard.found = true;
	
	          console.log('FOUND PAIR', this.firstCard, this.secondCard);
	
	          player.pairs++;
	
	          this.trigger('foundPair', player.guid, [this.firstCard, this.secondCard]);
	
	          if (this.getPairsLeft() === 0) {
	            this.started = false;
	            this.trigger('gameFinished', this.getLeadingPlayerGuid());
	          }
	
	          //same player can pick cards again
	          this.trigger('flipCard', player.guid, index);
	          this.nextTurn(this.currentTurn);
	          return;
	        } else {
	          //wait a bit before we set next player
	          if (this.nextTurnInterval) {
	            clearInterval(this.nextTurnInterval);
	            this.nextTurnInterval = null;
	          }
	          this.trigger('status', 'Checkout the cards and remember them!');
	          this.pickNextPlayerTimeout = setTimeout(function () {
	            return _this4.pickNextPlayer();
	          }, 3000);
	        }
	      }
	
	      this.trigger('flipCard', player.guid, index);
	    }
	  }, {
	    key: 'addPlayer',
	    value: function addPlayer(player) {
	      player = new _player2.default(player);
	      this.players.push(player);
	      this.trigger('addPlayer', player);
	      return player;
	    }
	  }, {
	    key: 'removePlayer',
	    value: function removePlayer(guid) {
	      var playerIndex = this.players.findIndex(function (player) {
	        return player.guid === guid;
	      });
	      console.log('Removed Player', playerIndex, guid);
	      var player = this.players[playerIndex];
	      this.players.splice(playerIndex, 1);
	
	      if (player && this.currentTurn === player.guid) {
	        if (this.players.length > 0) {
	          var nextGuid = this.players[(playerIndex + 1) % this.players.length].guid;
	          this.nextTurn(nextGuid);
	        } else {
	          this.started = false;
	        }
	      }
	
	      this.trigger('removePlayer', guid);
	    }
	  }, {
	    key: 'updatePlayer',
	    value: function updatePlayer() {}
	  }, {
	    key: 'getPlayer',
	    value: function getPlayer(guid) {
	      return this.players.find(function (player) {
	        return player.guid === guid;
	      });
	    }
	  }, {
	    key: 'pickNextPlayer',
	    value: function pickNextPlayer() {
	      var player = this.getPlayer(this.currentTurn);
	      if (this.players.length > 0) {
	        var index = this.players.indexOf(player) + 1;
	        var nextPlayer = this.players[index % this.players.length];
	        this.nextTurn(nextPlayer.guid);
	      } else {
	        this.started = false;
	      }
	    }
	  }, {
	    key: 'nextTurnTimeout',
	    value: function nextTurnTimeout() {
	      var _this5 = this;
	
	      if (!this.started) {
	        //should not do anything if theres no game going on!
	        return;
	      }
	
	      this.nextTurnSecondsLeft = this.nextTurnSecondsLeft || Date.now() + 1000 * 30;
	
	      if (this.nextTurnInterval) {
	        console.log('This interval should not exist!!!');
	        clearInterval(this.nextTurnInterval);
	        this.nextTurnInterval = null;
	      }
	
	      this.nextTurnInterval = setInterval(function () {
	
	        var secondsLeft = (_this5.nextTurnSecondsLeft - Date.now()) / 1000;
	
	        _this5.trigger('status', 'Player got ' + Math.round(secondsLeft * 10) / 10 + ' seconds to pick 2 cards!');
	        if (secondsLeft <= 0) {
	          clearInterval(_this5.nextTurnInterval);
	          _this5.nextTurnInterval = null;
	          _this5.pickNextPlayer();
	        }
	      }, 100 * 1);
	    }
	  }, {
	    key: 'nextTurn',
	    value: function nextTurn(guid) {
	      //unflip cards whos pair are not found yet
	      if (this.firstCard !== null && !this.getCard(this.firstCard).found) {
	        this.updateCard({
	          index: this.firstCard,
	          flipped: false
	        });
	      }
	
	      if (this.secondCard !== null && !this.getCard(this.secondCard).found) {
	        this.updateCard({
	          index: this.secondCard,
	          flipped: false
	        });
	      }
	
	      this.firstCard = null;
	      this.secondCard = null;
	      this.currentTurn = guid;
	      this.trigger('nextTurn', guid);
	      this.nextTurnSecondsLeft = Date.now() + 1000 * 30;
	      this.nextTurnTimeout();
	    }
	  }, {
	    key: 'getState',
	    value: function getState() {
	      return {
	        started: this.started,
	        nextTurnSecondsLeft: this.nextTurnSecondsLeft,
	        firstCard: this.firstCard,
	        secondCard: this.secondCard,
	        currentTurn: this.currentTurn,
	        players: this.players.map(function (player) {
	          return player.getInfo();
	        }),
	        cards: this.cards.map(function (card, i) {
	          return {
	            index: i,
	            name: card.flipped ? card.name : null,
	            flipped: card.flipped,
	            found: card.found,
	            src: card.flipped ? card.src : ''
	          };
	        })
	      };
	    }
	  }, {
	    key: 'setState',
	    value: function setState(state) {
	      this.started = state.started;
	      this.nextTurnSecondsLeft = state.nextTurnSecondsLeft;
	      this.firstCard = state.firstCard;
	      this.secondCard = state.secondCard;
	      this.currentTurn = state.currentTurn;
	
	      this.players = state.players.map(function (player) {
	        return new _player2.default(player);
	      });
	
	      this.cards = state.cards.map(function (card) {
	        return card;
	      });
	      this.nextTurnTimeout();
	      this.trigger('setState', state);
	    }
	  }]);
	
	  return Game;
	}(_es6EventEmitter2.default);
	
	exports.default = Game;

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("es6-event-emitter");

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Player = function () {
	  function Player(player) {
	    _classCallCheck(this, Player);
	
	    this.guid = player.guid;
	    this.name = player.name;
	    this.color = player.color;
	    this.pairs = player.pairs || 0;
	    this.totalPoints = 0;
	  }
	
	  _createClass(Player, [{
	    key: "getInfo",
	    value: function getInfo() {
	      return {
	        guid: this.guid,
	        name: this.name,
	        color: this.color,
	        pairs: this.pairs,
	        totalPoints: this.totalPoints
	      };
	    }
	  }]);
	
	  return Player;
	}();
	
	exports.default = Player;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "77c11d6bae0ca6044bd397efcee9d0f5.json";

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("guid");

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ }
/******/ ])));
//# sourceMappingURL=server.build.js.map