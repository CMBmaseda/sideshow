var update_interval;
var gravity_interval;
var posX = 200;
var posY = 200;
var BASE_SPEED = 3;
var current_speed = 3;
var jump_height = 13;
var gravity_const = 1;
var GRAVITY_CAP = 8;
var WORLD_SIZE = 2400;
var JUMP = 38;
var LEFT = 37;
var RIGHT = 39;
var DOWN = 40;
var keysDown = [];
var stage;
var sprite;
var score_counter;
var collidables = [];
var OBJ_ABOVE = 1;
var OBJ_BELOW = 2;
var OBJ_LEFT = 3;
var OBJ_RIGHT = 4;
var GRAPHICS = {};
GRAPHICS.running_left = "sideshow_images/moving-left.png";
GRAPHICS.running_right = "sideshow_images/moving-right.png";
GRAPHICS.jumping_left = "sideshow_images/moving-left.png";
GRAPHICS.jumping_right = "sideshow_images/moving-right.png";
GRAPHICS.standing_left = "sideshow_images/moving-left.png";
GRAPHICS.standing_right = "sideshow_images/moving-right.png";
GRAPHICS.coal = "sideshow_images/coal.png";
GRAPHICS.pipe = "sideshow_images/pipe.png";
GRAPHICS.question_block = "sideshow_images/question_block.gif";
GRAPHICS.stone1 = "sideshow_images/stone.png";
GRAPHICS.seagull = "sideshow_images/kangkodos.png";
GRAPHICS.treat = "sideshow_images/squishee.png";
GRAPHICS.score = "sideshow_images/butterfinger.png";
GRAPHICS.lava = "sideshow_images/lava.png";
var bOnSurface = false;
var bCanJump = true;
var GROUNDED_TIMER = 500;
var BOUNCE_FACTOR = 2;
var elevators = [];
var scorei = [];
var hitables = [];
var scoreboxes = [];
var treatboxes = [];
var warppipes = [];
var treats = [];
var bAttemptingToWarp = false;
var theta = 0;
var MOTION_LEFT = 0;
var MOTION_RIGHT = 1;
var hoizontal_motion_direction = MOTION_RIGHT;
var debug;
var collideCount;
var fpsCount;

function update(){
	fpsCount++;
	//update chacter motion appearance, running, jumping, standing..
	if (bOnSurface)
		sprite.src = (hoizontal_motion_direction==MOTION_RIGHT) ? GRAPHICS.standing_right : GRAPHICS.standing_left;
	if (keysDown.indexOf(DOWN) < 0)
		bAttemptingToWarp = false;

	for (key in keysDown){
		switch (keysDown[key]){
			case RIGHT:
				posX += current_speed;
				if (stage.scrollLeft<WORLD_SIZE)
					stage.scrollLeft = sprite.offsetLeft-(stage.offsetWidth/2)+(sprite.offsetWidth/2);
				if (bOnSurface)
					sprite.src = GRAPHICS.running_right;
				hoizontal_motion_direction = MOTION_RIGHT;
				break;
			case JUMP:
				if (bOnSurface && bCanJump){
					bCanJump = false;
					setTimeout(function(){bCanJump=true;},GROUNDED_TIMER);
					gravity_const = -jump_height;
					posY -= jump_height;
					bOnSurface = false;
					sprite.src = (hoizontal_motion_direction==MOTION_RIGHT) ? GRAPHICS.jumping_right : GRAPHICS.jumping_left;
				}
				break;
			case LEFT:
				if (bOnSurface)
					sprite.src = GRAPHICS.running_left;
				posX -= current_speed;
				stage.scrollLeft = sprite.offsetLeft-(stage.offsetWidth/2)+(sprite.offsetWidth/2);
				hoizontal_motion_direction = MOTION_LEFT;
				break;
			case DOWN:
				if (bOnSurface)
					bAttemptingToWarp = true;
				break;
			default:

		}
	}

	theta++;
	for (e in elevators){
		elevators[e].style.top = 269+45*Math.sin(theta/80)+"px";
		// console.log(elevators[e].style.top);
	}

	// correct character position if hes colliding with objects
	collisionAdjust();

	render();

}

function isObtainable(obj){
	if (treats.indexOf(obj) > -1){
		removeFromCollection(treats,obj);
		animateFormChange(sprite, sprite.className, "player_big", 8);
		return true;
	}

	if (scorei.indexOf(obj) > -1){
		removeFromCollection(scorei,obj);
		removeFromCollection(collidables, obj);
		animatePoints(obj,1);
		stage.removeChild(obj);

		takeScore();
		return true;
	}
	return false;
}

function playHitAnimation(obj){
	if (hitables.indexOf(obj) > -1){
		var currY = obj.offsetTop;
		obj.style.top = currY-5+"px";
		setTimeout(function(){obj.style.top = currY+"px"},200);
	}
	if (scoreboxes.indexOf(obj) > -1){
		var c = document.createElement("img");
		stage.appendChild(c);
		c.src = GRAPHICS.score;
		c.style.position = "absolute";
		c.style.top = obj.offsetTop + "px";
		c.style.left = (obj.offsetLeft + (obj.offsetWidth/2)) - (c.offsetWidth/2) + "px";
		obj.style.zIndex = 1000;

		animatePoints(c,1);
		takeScore();

		animateUp(c, 8,1,function(){
							stage.removeChild(c);
						});
	}
	if (treatboxes.indexOf(obj) > -1){
		removeFromCollection(treatboxes, obj);
		var c = document.createElement("img");
		stage.appendChild(c);
		c.src = GRAPHICS.treat;
		c.style.position = "absolute";
		c.style.top = obj.offsetTop + "px";
		c.style.left = (obj.offsetLeft + (obj.offsetWidth/2)) - (c.offsetWidth/2) + "px";
		obj.style.zIndex = 1000;
		treats.push(c);

		collidables.push(c);
		scorei.push(c);

		animateUp(c, 8,1,function(){
		});
	}
}

function animatePoints(obj,pointsValue){
	var p = document.createElement("div");
	p.className = "points";
	stage.appendChild(p);
	p.innerHTML = pointsValue;
	p.style.top = obj.offsetTop + "px";
	p.style.left = obj.offsetLeft + "px";
	animateUp(p, 8,1,function(){
						stage.removeChild(p);
					});
}

function animateFormChange(obj, originalClassName, newClassName, times){
	if (times == 0) return;
	obj.className = (times % 2 == 0) ?  originalClassName : newClassName;
	setTimeout(function(){animateFormChange(obj, originalClassName, newClassName, --times);},100);
}

function animateUp(obj,amount,incY,endCallBack){
	if (incY >= amount) {
		endCallBack();
		return;
	}
	obj.style.top = obj.offsetTop - incY + "px";
	setTimeout(function(){animateUp(obj,amount,incY+1,endCallBack);},70);
}

function animateDown(obj,amount,incY,endCallBack){
	if (incY >= amount) {
		endCallBack();
		return;
	}
	obj.style.top = obj.offsetTop + incY + "px";
	setTimeout(function(){animateDown(obj,amount,incY+1,endCallBack);},70);
}

function animateHorizontal(obj,incX){
	obj.style.left = obj.offsetLeft + incX + "px";
	setTimeout(function(){animateHorizontal(obj,incX);},30);
}

function isWarpPipe(obj){
	if (warppipes.indexOf(obj) > -1 && bAttemptingToWarp){
		clearTimeout(update_interval);
		animateDown(sprite,15,1,function(){
			window.location.reload();
		});
	}
}

function takeScore(){
	score_counter.innerHTML = parseInt(score_counter.innerHTML)+1;
}

function collisionAdjust(){
	if (posX < stage.offsetLeft) posX = 5;
	if (posX+sprite.offsetWidth>WORLD_SIZE) posX = WORLD_SIZE - sprite.offsetWidth;

	bOnSurface = false;
	collideCount = 0;

	for (c in collidables){

			if (!isCloseToCharacter(collidables[c])) continue;
			collideCount++;

			switch (getSideColliding(collidables[c])){
				case OBJ_ABOVE:
					if (isObtainable(collidables[c])) break;
					posY = collidables[c].offsetTop-sprite.offsetHeight;
					bOnSurface = true;
					if (isWarpPipe(collidables[c])) break;
					current_speed = BASE_SPEED;
					break;
				case OBJ_LEFT:
					if (isObtainable(collidables[c])) break;
					posX = collidables[c].offsetLeft-sprite.offsetWidth;
					if (!bCanJump)
						current_speed = 1;
					break;
				case OBJ_RIGHT:
					if (isObtainable(collidables[c])) break;
					posX = collidables[c].offsetLeft+collidables[c].offsetWidth;
					if (!bCanJump)
						current_speed = 1;
					break;
				case OBJ_BELOW:
					playHitAnimation(collidables[c]);
					if (isObtainable(collidables[c])) break;
					posY = collidables[c].offsetTop+collidables[c].offsetHeight;
					gravity_const = BOUNCE_FACTOR;
					break;
				default:
					sprite.style.backgroundColor = "transparent";
			}
	}
}

function isCloseToCharacter(obj){
	return Math.abs(obj.offsetLeft - sprite.offsetLeft) < 100 && Math.abs(obj.offsetTop - sprite.offsetTop) < 100;
}

function getSideColliding(obj){

	if (posY+sprite.offsetHeight>obj.offsetTop &&
		(posX + (sprite.offsetWidth/2)) > obj.offsetLeft &&
		(posX + (sprite.offsetWidth/2)) < (obj.offsetLeft+obj.offsetWidth) &&
		posY < obj.offsetTop &&
		posY+sprite.offsetHeight<(obj.offsetTop+obj.offsetHeight))
		return OBJ_ABOVE;
	if (posX+sprite.offsetWidth>obj.offsetLeft &&
		(posY + (sprite.offsetHeight/2)) < (obj.offsetTop+obj.offsetHeight) &&
		posX < obj.offsetLeft &&
		(posY + (sprite.offsetHeight/2)) > obj.offsetTop)
		return OBJ_LEFT;
	if (posX<(obj.offsetLeft+obj.offsetWidth) &&
		posX+sprite.offsetWidth>(obj.offsetLeft+obj.offsetWidth) &&
		posY+(sprite.offsetHeight/2) > obj.offsetTop &&
		posY+(sprite.offsetHeight/2) < (obj.offsetTop+obj.offsetHeight))
		return OBJ_RIGHT;
	if (posY>obj.offsetTop &&
		posY < (obj.offsetTop+obj.offsetHeight) &&
		posX + (sprite.offsetWidth/2) > obj.offsetLeft &&
		posX + (sprite.offsetWidth/2) < (obj.offsetLeft+obj.offsetWidth))
		return OBJ_BELOW;
	return 0;
}

function render(){
	sprite.style.left = posX + "px";
	sprite.style.top = posY + "px";
}

function renderWorld(){
	stage = document.getElementById('stage');
	sprite = document.getElementById('sprite');
	score_counter = document.getElementById('score_counter');

	var coal = [];
	for (var i = 0; i < 24; i++){
		coal.push(dropGroundUnit(null, GRAPHICS.coal, i*100, stage.offsetHeight-32));
		collidables.push(coal[i]);
	}

	setTimeout(function(){
		var b4 = dropGroundUnit(coal[9], GRAPHICS.pipe);
		var b5 = dropGroundUnit(coal[8], GRAPHICS.question_block, -15,-155 );
		hitables.push(b5);
		scoreboxes.push(b5);

		for (var i = 0; i<2; i++){
			var bb1 = dropGroundUnit(coal[5], GRAPHICS.stone1,i*32,-57);
			hitables.push(bb1);
			collidables.push(bb1);
			if (i==1){
				treatboxes.push(bb1);
			}
		}
		for (var i = 0; i<3; i++){
			var bb1 = dropGroundUnit(coal[7], GRAPHICS.stone1,i*32,-63);
			hitables.push(bb1);
			collidables.push(bb1);
		}
		var b6 = dropGroundUnit(coal[10], GRAPHICS.seagull);
		var b7 = dropGroundUnit(coal[14], GRAPHICS.seagull);
		elevators.push(b6);
		elevators.push(b7);



		for (var i = 0; i<3; i++){
			var c1 = dropGroundUnit(coal[7], GRAPHICS.score, i*32,-10);
			collidables.push(c1);
			scorei.push(c1);
		}
		for (var i = 0; i<6; i++){
			var c1 = dropGroundUnit(coal[6], GRAPHICS.score, i*32+5, -100-i*32);
			collidables.push(c1);
			scorei.push(c1);
		}
		for (var i = 0; i<3; i++){
			var c1 = dropGroundUnit(coal[10], GRAPHICS.score, i*32, -232);
			collidables.push(c1);
			scorei.push(c1);
		}

		for (var i = 1; i<4; i++){
			var bb1
			if (i == 3) {
				bb1 = dropGroundUnit(coal[15], GRAPHICS.question_block,i*32,-i*32);
				treatboxes.push(bb1);
			}
			else
				bb1 = dropGroundUnit(coal[15], GRAPHICS.stone1,i*32,-2*32);
			hitables.push(bb1);
			collidables.push(bb1);

			var c1 = dropGroundUnit(b7, GRAPHICS.score, 12,-i*32-140);
			collidables.push(c1);
			scorei.push(c1);
		}

		for (var j = 0; j < 9; j++){
			for (var i = 0; i<11; i++){
				if (i <= j) continue;
				var c1 = dropGroundUnit(coal[20], GRAPHICS.lava, i*24, -j*24);
				collidables.push(c1);
			}
		}

		var b8 = dropGroundUnit(coal[12], GRAPHICS.pipe);
		collidables.push(b8);

		var b9 = dropGroundUnit(coal[23], GRAPHICS.pipe);
		warppipes.push(b9);
		collidables.push(b9);

		collidables.push(b4);
		collidables.push(b5);
		collidables.push(b6);
		collidables.push(b7);
	},1000);
}

function dropGroundUnit(onGroundUnit ,graphic_src ,left, bottom){
		var ground_unit = document.createElement("img");
		ground_unit.src = graphic_src;
		stage.appendChild(ground_unit);
		ground_unit.style.position = "absolute";
		ground_unit.style.top = ((onGroundUnit != null) ? (onGroundUnit.offsetTop-ground_unit.offsetHeight + (bottom||0)) : bottom) + "px";
		ground_unit.style.left = ((onGroundUnit != null) ? onGroundUnit.offsetLeft + (left||0) : left) + "px";
		return ground_unit;
}

function gravity(){
	if (!bOnSurface)
		posY+=gravity_const;
	gravity_const++;
	if (gravity_const>GRAVITY_CAP) gravity_const = GRAVITY_CAP;
}

function removeFromCollection(arr,obj){
	if (arr.indexOf(obj) > -1)
		arr.splice(arr.indexOf(obj),1);
}

function onkeyDown(e){
	var evt = window.event || e;
	var keyunicode=e.charCode || e.keyCode;
	if (evt.preventDefault)
		evt.preventDefault();
	else{
		evt.returnValue = false;
	}
	if (keysDown.indexOf(keyunicode) > -1) return;
	keysDown.push(keyunicode);

	return false;
}

function onKeyUp(e){
	var evt = window.event || e;
	var keyunicode=e.charCode || e.keyCode;
	removeFromCollection(keysDown, keyunicode);
}

function loadGraphics(onloaded){
		for (g in GRAPHICS){
			var img = new Image();
			img.src = GRAPHICS[g];
			img.onload = (function(h,g){
					return function(){
						g = h;
					}
				})(img.src, GRAPHICS[g]);

		}
		onloaded();
}

$(document).ready(function(){

	debug = document.getElementById('debug');

	loadGraphics(function(){
		renderWorld();
		stage.scrollLeft = 0;
	});

	setTimeout(function(){
		update_interval = setInterval(function(){update();},15);
		gravity_interval = setInterval(function(){gravity();},30);

		$(this).keydown(onkeyDown);
		$(this).keyup(onKeyUp);
	},500);
});
