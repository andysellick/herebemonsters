/* globals Deferred, hbm */

var loaders = [];
var imgpath = 'static/img/';
var imageloadprogress = 0;
var imageloadtotal = 0;

var allimages = [
	{
		'name': 'monsters',
		'images': ['ray.svg'],
		'dir': ''
	},
];

//preload images
function loadFile(src,array,num){
	var deferred = new Deferred();
	var sprite = new Image();
	sprite.onload = function() {
		array[num] = sprite;
		deferred.resolve();
		imageloadprogress++;
		//document.getElementById('loading').style.width = (imageloadprogress / imageloadtotal) * 100 + '%';
	};
	sprite.src = src;
    return deferred.promise();
}

//loop through and call all the preload images
function callAllPreloads(array,dir){
    for(var z = 0; z < array.length; z++){
        loaders.push(loadFile(dir + array[z], array, z));
    }
}

for(var im = 0; im < allimages.length; im++){
	imageloadtotal += allimages[im].images.length;
	callAllPreloads(allimages[im].images, imgpath + allimages[im].dir + '/');
}

//generic object for a monster
function MonObj(x,y,w,sprite,spritex,spritey,spritew,spriteh){
	this.percx = x;
	this.percy = y;
	this.x = 0;
	this.y = 0;
	//this.origy = x;
	this.percw = w;
	this.perch = 0;
	this.w = 0;
	this.h = 0;
	this.sprite = sprite;
	this.spritex = spritex;
	this.spritey = spritey;
	this.spritew = spritew;
	this.spriteh = spriteh;
	this.origspriteh = spriteh;
	this.speed = 10;

	this.clicked = 1;
	/*
	this.imgbank = img;
	this.currframe = 0;
	this.aframes = aframes;
	*/
	this.init = function(){
		this.x = (hbm.canvasw / 100) * this.percx;
		this.y = (hbm.canvash / 100) * this.percy;
		this.w = (hbm.canvasw / 100) * this.percw;
		//this.h = (hbm.canvash / 100) * this.perch;

		this.h = (this.w / 100) * ((this.spriteh / this.spritew) * 100);

		//this.y += this.actualh;
		//this.actualh = 0;
		//this.spriteh = 0;
	};
	this.reveal = function(){
		if(!this.clicked){
			//this.spritey = Math.max(
			//this.actualh = Math.min(this.origh, this.actualh + ((this.origh / 100) * this.speed));
			//this.spriteh = Math.min(this.origspriteh, this.spriteh + ((this.origspriteh / 100) * this.speed));
			//this.actualy = Math.max(this.origy, this.actualy - ((this.origh / 100) * this.speed));
		}
	};
}




(function( window, undefined ) {
var hbm = {
	canvas: 0,
	ctx: 0,
	canvasw: 0,
	canvash: 0,
	idealw: 16,
	idealh: 9,
	canvasmode: 1,
	
	monsters: [],

    general: {
        init: function(){
			hbm.canvas = document.getElementById('canvas');
            if(!hbm.canvas.getContext){
                document.getElementById('canvas').innerHTML = 'Your browser does not support canvas. Sorry.';
            }
            else {
                hbm.ctx = hbm.canvas.getContext('2d');
                this.initCanvasSize();

	            this.setupEvents();
	            hbm.game.createMonsters();
	            //hbm.game.loop();
	            setInterval(hbm.game.loop,100);
            }
        },

        //initialise the size of the canvas based on the ideal aspect ratio and the size of the parent element
		initCanvasSize: function(){
			var parentel = document.getElementById('canvasparent');
			var targetw = parentel.offsetWidth;
			var targeth = parentel.offsetHeight;

			if(hbm.canvasmode === 1){ //resize the canvas to maintain aspect ratio depending on screen size (may result in gaps either side)
				var sizes = hbm.general.calculateAspectRatio(hbm.idealw,hbm.idealh,targetw,targeth);
				hbm.canvas.width = hbm.canvasw = sizes[0];
				hbm.canvas.height = hbm.canvash = sizes[1];
			}
			else { //make canvas always full width, with appropriately scaled height (may go off bottom of page)
				hbm.canvas.width = targetw;
				var scaleh = hbm.general.calculatePercentage(targetw,hbm.idealw);
				hbm.canvas.height = (hbm.idealh / 100) * scaleh;
			}
        },
        //given a width and height representing an aspect ratio, and the size of the containing thing, return the largest w and h matching that aspect ratio
		calculateAspectRatio: function(idealw,idealh,parentw,parenth){
			var aspect = Math.floor((parenth / idealh) * idealw);
			var cwidth = Math.min(idealw, parentw);
			var cheight = Math.min(idealh, parenth);
			var w = Math.min(parentw,aspect);
			var h = (w / idealw) * idealh;
			return([w,h]);
		},
        //returns the percentage amount that object is of wrapper
        calculatePercentage: function(object,wrapper){
			return((100 / wrapper) * object);
		},


        clearCanvas: function(){
            hbm.canvas.width = hbm.canvas.width; //this is apparently a hack but seems to work
        },
        randomNumber: function(min,max){
			return((Math.random() * (max - min) + min));
		},

		//click events
        setupEvents: function(){
			var clickEvent = ((document.ontouchstart!==null)?'click':'touchstart');
			hbm.canvas.addEventListener(clickEvent,function(e){
				hbm.general.getMousePos(e);
			},false);
		},

		getMousePos: function(e){
			var rect = hbm.canvas.getBoundingClientRect();
			var x = e.clientX - rect.left;
			var y = e.clientY - rect.top;
			if(typeof e.changedTouches !== 'undefined'){
				x = e.changedTouches[0].pageX - rect.left;
				y = e.changedTouches[0].pageY - rect.top;
			}
			console.log(x,y);

			hbm.ctx.beginPath();
			hbm.ctx.rect(x - 25, y - 25, 50, 50);
			hbm.ctx.fillStyle = 'yellow';
			hbm.ctx.fill();
			hbm.ctx.lineWidth = 7;
			hbm.ctx.strokeStyle = 'black';
			hbm.ctx.stroke();
		},

	},
	game: {
		loop: function(){
			hbm.general.clearCanvas();
			//console.log('moo');
			var l = hbm.monsters.length;
			for(var m = 0; m < l; m++){
				hbm.monsters[m].reveal();
				hbm.game.drawMonster(hbm.monsters[m]);
			}
		},

		createMonsters: function(){
			//x,y,w,sprite,spritex,spritey,spritew,spriteh - h is calculated automatically based on spritew and spriteh
			var monster = new MonObj(0,0,50,allimages[0].images[0],0,0,260,340);
			monster.init();
			console.log('Mon w',monster.w,'h',monster.h);
			hbm.monsters.push(monster);
		},

		drawMonster: function(mon){
			hbm.ctx.beginPath();
			hbm.ctx.rect(mon.x, mon.y, mon.w, mon.h);
			hbm.ctx.fillStyle = 'yellow';
			hbm.ctx.fill();

			hbm.ctx.drawImage(mon.sprite, mon.spritex, mon.spritey, mon.spritew, mon.spriteh, mon.x, mon.y, mon.w, mon.h);
		},
	}
};
window.hbm = hbm;
})(window);

window.onload = function(){
    Deferred.when(loaders).then(
    	function(){
		    hbm.general.init();
		    //hbm.general.addClass(document.getElementById('loading'),'fadeout');
		}
    );

	var resize;
	window.addEventListener('resize', function(event){
		clearTimeout(resize);
		resize = setTimeout(hbm.general.initCanvasSize,200);
	});
};