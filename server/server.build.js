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
/******/ 	__webpack_require__.p = "./server/";
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
	
	app.use(express.static('./dist'));
	
	app.use(__webpack_require__(5)(io));
	
	app.get('/', function (req, res) {
	    res.sendfile('./dist/index.html');
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

	'use strict';
	
	var _game = __webpack_require__(6);
	
	var _game2 = _interopRequireDefault(_game);
	
	var _cards = __webpack_require__(9);
	
	var _cards2 = _interopRequireDefault(_cards);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var express = __webpack_require__(2);
	var Guid = __webpack_require__(10);
	var fs = __webpack_require__(11);
	
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
	
	var memoryGame = function memoryGame(io) {
	  var router = express.Router();
	  var game = new _game2.default();
	  game.setCards(getRandomCards());
	
	  game.on('addPlayer', function (player) {
	    io.emit('addPlayer', player);
	  });
	
	  game.on('removePlayer', function (guid) {
	    io.emit('removePlayer', guid);
	  });
	
	  game.on('updatePlayer', function (player) {
	    io.emit('updatePlayer', player);
	  });
	
	  game.on('nextTurn', function (guid) {
	    io.emit('nextTurn', guid);
	  });
	
	  router.get('/api', function (req, res, next) {
	    console.log('Got APi');
	  });
	
	  var i = 0;
	  setInterval(function () {
	    io.emit('status', 'Loop ' + i++);
	    if (game.players.length < 2) {
	      io.emit('status', 'Not enough players!');
	      return;
	    }
	
	    if (!game.started) {
	      game.started = true;
	      io.emit('status', 'Starting new game...');
	      game.setCards(getRandomCards());
	      io.emit('gameState', game.getState());
	      game.nextTurn(game.players[0].guid);
	    }
	
	    var pairsLeft = game.cards.length;
	    game.cards.forEach(function (card) {
	      if (card.found) {
	        pairsLeft--;
	      }
	    });
	    pairsLeft /= 2;
	
	    io.emit('status', 'Pairs left... ' + pairsLeft);
	  }, 3000);
	
	  io.on('connection', function (socket) {
	    console.log('a user connected');
	    socket.emit('status', 'Connected...');
	
	    socket.on('flipCard', function (index) {
	      if (!socket.player) {
	        return;
	      }
	
	      var player = socket.player;
	
	      game.flipCard(player, index);
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
	          if (existingPlayer.socket.connected) {
	            existingPlayer.socket.disconnect();
	          }
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
	  return router;
	};
	
	module.exports = memoryGame;

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
	      this.trigger('setCards');
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
	    key: 'updateCards',
	    value: function updateCards(cards) {
	      var _this3 = this;
	
	      cards.forEach(function (card) {
	        _this3.updateCard(card);
	      });
	    }
	  }, {
	    key: 'flipCard',
	    value: function flipCard(player, index) {
	      if (this.currentTurn != player.guid) {
	        this.trigger('error', 'player tried to flip card without it being their turn!');
	        return;
	      }
	
	      var card = this.cards[index];
	
	      if (!card) {
	        this.trigger('error', 'Card doesnt exist!');
	        return;
	      }
	
	      if (this.firstCard && this.secondCard) {
	        this.trigger('error', 'This player already picked 2 cards!');
	        return;
	      }
	
	      if (!this.firstCard) {
	        this.firstCard = card;
	      } else if (this.firstCard) {
	        this.secondCard = card;
	      }
	
	      if (this.firstCard && this.secondCard) {
	        if (this.firstCard.name === this.secondCard.name) {
	          //player scored
	          this.firstCard.found = true;
	          this.secondCard.found = true;
	
	          this.trigger('foundPair', player, [this.firstCard, this.secondCard]);
	        }
	
	        var _index = this.players.indexOf(player) + 1;
	        var nextPlayer = this.players[_index % this.players.length];
	        this.nextTurn(nextPlayer.guid);
	      }
	
	      this.trigger('flipCard', card);
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
	        this.nextTurn(this.players[(playerIndex + 1) % this.players.length]);
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
	    key: 'nextTurn',
	    value: function nextTurn(guid) {
	      console.log('Next Turn', guid);
	      this.currentTurn = guid;
	      this.trigger('nextTurn', guid);
	    }
	  }, {
	    key: 'getState',
	    value: function getState() {
	      return {
	        currentTurn: this.currentTurn,
	        players: this.players.map(function (player) {
	          return player.getInfo();
	        }),
	        cards: this.cards.map(function (card, i) {
	          return {
	            index: i,
	            name: card.flipped ? card.name : null,
	            flipped: card.flipped,
	            found: card.found
	          };
	        })
	      };
	    }
	  }, {
	    key: 'setState',
	    value: function setState(state) {
	      this.currentTurn = state.currentTurn;
	
	      this.players = state.players.map(function (player) {
	        return new _player2.default(player);
	      });
	
	      this.cards = state.cards.map(function (card) {
	        return card;
	      });
	
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
	    this.pairs = 0;
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

	module.exports = __webpack_require__.p + "54d8b1839b94c790c33698346d57bff9.json";

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("guid");

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ }
/******/ ])));
//# sourceMappingURL=server.build.js.map