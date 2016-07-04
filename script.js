$(document).ready(function(){
	
	var winningCombos = [['c1','c2','c3'],['c4','c5','c6'],['c7','c8','c9'],['c1','c4','c7'],['c2','c5','c8'],['c3','c6','c9'],['c1','c5','c9'],['c3','c5','c7']],
			userMovesArr = [], aiMovesArr = [], player1 = '', player2 = '', possibleCombos = [], busyCells = [], p1moves = [], p2moves = [], won = false, turn = "user";
		
	$(".player-info .btn-player").on("click", function(){
		Game.reset(); //choose new player during game? - reset everything

		$(".player-info .btn-player").removeClass('btn-primary chosen').addClass('computer');
		$(this).removeClass('computer').addClass('btn-primary chosen');
		
	});
	
	$("#start_game").on("click", function(){
		if (turn === "user") {
			turn = "ai";
		} else if (turn === "ai") {
			turn = "user";
		}
		Game.reset();	//reset board
		Game.start(); 
	});
	
	var Game = {
		reset: function(){
			$(".game-row .col-xs-4 span").text('').removeClass('busy pl1 pl2').css("color","#666");
			$("#info_text h3").text("");
			userMovesArr = [], aiMovesArr = [], player1 = '', player2 = '', possibleCombos = [], busyCells = [], p1moves = [], p2moves = [], won = false;
		},
		start: function(){
			var clicked = '';
			
			player1 = $(".player-info .chosen").text();
			player2 = $(".player-info .computer").text();
			
			if (turn === "ai") {
				Game.computerAI();
			} else {
				$(".game-row .col-xs-4").on("click",function(){
					if ( !$(this).find('span').hasClass("busy") && !won ) {
						clicked = $(this).attr('id');
						$("#"+ clicked + " span").text(player1).addClass("busy pl1");
						Game.computerAI();
					} else {
						return false;
					}
				});
			}
		},
		computerAI: function() {
			
			function getRandom(minOp,maxOp) {
				return Math.floor(Math.random() * (maxOp - minOp + 1)) + minOp;
			}

			var options = Game.evaluateBoard(),
					moves = [], allMoves = [];
			
			options.forEach(function(el){
				if (typeof el !== "string") {
					moves.push(el);
					allMoves = moves.reduce(function(a,b){
						return a.concat(b);
					});
				}
			});
			
			if (allMoves.length === 1) {
				Game.computerMove(allMoves[0]);
			} else {
				var busy = Game.getBusyCells(),
						allCells = [],
						cleanMoves = [];
				
				$(".col-xs-4").each(function(el){
					allCells.push(this.id);
				});
				
				if (allMoves.length === 0) {
					cleanMoves = Game.cleanMoves(busy,allCells);
				} else {
					cleanMoves = Game.cleanMoves(busy,allMoves);
				}
				
				var opt = getRandom(0,cleanMoves.length-1);
				Game.computerMove(cleanMoves[opt]);
			}			
		},
		computerMove: function(choice) {
			if (!won) {
				setTimeout(function() {
					$("#" + choice + " span").text(player2).addClass("busy pl2");
					Game.evaluateBoard();
				}, 500);
			}
		},
		getBusyCells: function() {
			busyCells = [];
			$('.busy').each( function() {
				busyCells.push($(this).closest('div')[0].id);
			});
			return busyCells;
		},
		evaluateBoard: function() {
			p1moves = [], p2moves = [];
			
			$('span.busy.pl1').each( function() {
				p1moves.push($(this).closest('div')[0].id);
			});
			
			$('span.busy.pl2').each( function() {
				p2moves.push($(this).closest('div')[0].id);
			});
			
			return Game.cleanMoves(Game.getBusyCells(),Game.movesToWin());
		},
		movesToWin: function() {
			userMovesArr = [], aiMovesArr = [];
			winningCombos.forEach(function(wcel){
				var userFound = 0, aiFound = 0;
				
				p1moves.forEach(function(p1) {
					if (wcel.indexOf(p1) > -1) {
						userFound++;
					}
				});
				userMovesArr.push(userFound);
				
				p2moves.forEach(function(p2) {
					if (wcel.indexOf(p2) > -1) {
						aiFound++;
					}
				});
				aiMovesArr.push(aiFound);
			});
			
			if (aiMovesArr.indexOf(2) > -1) {
				var idxs = [];
				for(var i = 0; i < aiMovesArr.length; i++) {
					if (aiMovesArr[i] === 2) {
						idxs.push(i);
					}
				}
			} else if (userMovesArr.indexOf(2) > -1) {
				var idxs = [];
				for(var j = 0; j < userMovesArr.length; j++) {
					if (userMovesArr[j] === 2) {
						idxs.push(j);
					}
				}
			} else {
				var idxs = [];
				for(var k = 0; k < aiMovesArr.length; k++) {
					if (aiMovesArr[k] === 1) {
						idxs.push(k);
					}
				}
				for(var l = 0; l < userMovesArr.length; l++) {
					if (userMovesArr[l] === 1) {
						idxs.push(l);
					}
				}
			}
						
			if (aiMovesArr.indexOf(3) > -1) {
				winningCombos[aiMovesArr.indexOf(3)].forEach(function(el){
					$("#" + el + " span").css("color","green"); //winning case
					won = true;
				});	
			}
						
			if (userMovesArr.indexOf(3) > -1) {
				winningCombos[userMovesArr.indexOf(3)].forEach(function(el){
					$("#" + el + " span").css("color","green"); //winning case
					won = true;
				});	
			}
						
			if( $(".busy").length === 9 && !won) {
				$(".busy").css("color","red");
				$("#info_text h3").text("Game over, no one has won!"); //all the board is full and no one has won
			}
			
			var possibleCombos = [];
			
			idxs.forEach(function(el){
				possibleCombos.push(winningCombos[el]);
			});
			
			var pc = [];
			
			possibleCombos.forEach(function(el){
				pc.push(Game.cleanMoves(Game.getBusyCells(),el));
			});
						
			return pc;
		},
		cleanMoves: function(what,from) {
			var result = [];
			
			for (var j=0;j<from.length;j++) {
				if (what.indexOf(from[j]) < 0) {
					result.push(from[j]);
				}
			}			
			
			return result;
		}
	};
});