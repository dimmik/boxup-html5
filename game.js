/*
version history
	06 Nov 2013 Dmitry Andrievsky
		Initial game algo
		prototype of loading data from file on server
	07 Nov 2013 Dmitry Andrievsky
		Game field size adjustment
		17 Levels
		Mouse/tap control
		Level reset/goto level/next level functionality
*/

var currGame;
	function TheGame(canvas, levels) {
		this.canvas = canvas;
		//this.levels = levels; //
		this.levels = new Array();
		this.currentLevel = 0;
		//alert("levels: " + levels);
		for (t=0; t<levels.length; t++)
		{
			this.levels[t] = {};
			this.levels[t]["name"] = levels[t];
			this.levels[t]["data"] = loadLevel(levels[t]);
			//alert("t: " + t + " fields: " + this.fields[t]);
		}
		//alert("fields: " + this.fields.length);
		this.SetField(this.levels[this.currentLevel]["data"]);
		this.stopped = true;
		currGame = this;
	}

	TheGame.prototype.SetField = function(f) {
		this.field = new Array();
		for (i=0; i<f.length; i++)
		{
			this.field[i] = new Array();
			for (j=0; j<f[i].length; j++)
			{
				this.field[i][j] = new Array();
				for (k=0; k<f[i][j].length; k++)
				{
					this.field[i][j][k] = f[i][j][k];
				}
			}
		}
		this.dimX = this.field.length;
		this.dimY = this.field[0].length;
		this.dotX = 0;
		this.dotY = 0;
		for (i = 0; i < this.dimX; i++)
		{
			for (j=0; j < this.dimY; j++)
			{
				if (this.field[i][j] == 'DT')
				{
					this.dotX = i;
					this.dotY = j;
				}
			}
		}
	}

	TheGame.prototype.setGridSide = function(s){
		var maxGridSide = s;
		var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],
			x=w.innerWidth||e.clientWidth||g.clientWidth,
			y=w.innerHeight||e.clientHeight||g.clientHeight;
		var sX = Math.floor((x - 20)/this.dimX);
		var sY = Math.floor((y - 20)/this.dimY);
		var ss = sX > sY ? sY : sX;
		//alert('x: ' + sX + ' y: ' + sY + ' ss: ' + ss);
		this.side = ss > maxGridSide ? maxGridSide : ss;
		//alert('side: ' + this.side);
	}

	TheGame.prototype.initField = function() {
	  this.canvas.width = this.side * this.dimX + 5;
	  this.canvas.height = this.side * this.dimY + 5;
      var ctx = this.canvas.getContext("2d");
	  ctx.width = ctx.width;
	  // lines
	  for (i = 0; i <= this.dimX; i++)
	  {
		ctx.moveTo(i * this.side + 0.5, 0.5);
		ctx.lineTo(i * this.side + 0.5, this.dimY * this.side);
	  }
	  for (i = 0; i <= this.dimY; i++)
	  {
		ctx.moveTo(0.5, i * this.side + 0.5);
		ctx.lineTo(this.dimX * this.side, i * this.side + 0.5);
	  }
		ctx.strokeStyle = "#000";
		ctx.stroke();
		for (i = 0; i < this.dimX; i++ )
		{
			for (j = 0; j < this.dimY; j++ )
			{
				this.drawElems(ctx, i, j, this.field[i][j]);
			}
		}
    }

	TheGame.prototype.drawEndLevel = function(){
		var ctx = this.canvas.getContext("2d");
		var style = "rgba(50, 50, 50, 0.3)";
		ctx.fillStyle=style;
		ctx.fillRect(
			this.side / 2,
			this.side / 2,
			(this.side) * (this.dimX - 1),
			(this.side) * (this.dimY - 1)
			);
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.font="20px Arial";
		ctx.fillText(this.levels[this.currentLevel]["name"] + " finished.",
			this.side / 2 + this.side / 5,
			this.side / 2 + this.side / 2
			);
	}

	TheGame.prototype.drawElems = function(ctx, x, y, defs) { // defs - array
		// clean
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.fillRect(
			x * this.side + 1,
			y * this.side + 1,
			this.side - 1,
			this.side - 1
			);
		for (k = 0; k < defs.length; k++)
		{
			this.drawSingleElem(ctx, x, y, defs[k]);
		}
	}

	TheGame.prototype.drawSingleElem = function(ctx, x, y, def){
		if (def == "DT")
		{
			ctx.fillStyle = "rgb(0,0,0)";
			ctx.fillRect(
				x * this.side + this.side / 2 - this.side/10,
				y * this.side + this.side / 2 - this.side/10,
				this.side/5,
				this.side/5
				);
			return;
		}
		if (def == "BL") // black
		{
			ctx.fillStyle = "rgb(0, 0, 0)";
			ctx.fillRect(
				x * this.side + 1,
				y * this.side + 1,
				this.side - 1,
				this.side - 1
				);
			return;
		}
		var color;
		var size;
		switch (def.charAt(0)){
			case 'S': color = "rgb(200, 0, 0)"; size = this.side * 0.5; break; // subject
			case 'T': color = "rgb(0, 0, 200)"; size =this.side * 0.8; break; // target
			case 'B': color = "rgb(0, 0, 0)"; size = this.side * 0.8; break; // big
			case 'L': color = "rgb(0, 0, 0)"; size = this.side * 0.5; break; // small
			default: return;
		}
		ctx.fillStyle = color;
		var openSide = def.charAt(1);
		//alert('def: ' + def + ' c: ' + ctx.fillStyle + " -- " + color + " s: " + size + ' open: ' + openSide + "\nx = " + x + ", y = " + y);
		// north
		if (!(openSide == 'N'))
		{
			ctx.fillRect(
				x * this.side + (this.side - size)/2, 
				y * this.side + (this.side - size)/2, 
				size, this.side/10);
		}
		// south
		if (!(openSide == 'S'))
		{
			ctx.fillRect(
				x * this.side + (this.side - size)/2, 
				y * this.side + this.side - (this.side - size)/2 - this.side/10, 
				size, this.side/10);
		}
		// west
		if (!(openSide == 'W'))
		{
			ctx.fillRect(
				x * this.side + (this.side - size)/2, 
				y * this.side + (this.side - size)/2, 
				this.side/10, size);
		}
		// east
		if (!(openSide == 'E'))
		{
			ctx.fillRect(
				x * this.side + this.side - (this.side - size)/2 - this.side/10, 
				y * this.side + (this.side - size)/2, 
				this.side/10, size);
		}
	
	}

	TheGame.prototype.reDraw = function(x, y){
		var ctx = this.canvas.getContext("2d");
		this.drawElems(ctx, x, y, this.field[x][y]);
	}
	
	TheGame.prototype.move = function(dir){
		if (this.stopped)
		{
			return;
		}
		//alert('move dx = ' + this.dotX + ' dy = ' + this.dotY);
		var newX = dir == 'L' 
			? this.dotX - 1 
			: dir == 'R' 
				? this.dotX + 1 
				: this.dotX;
		var newY = dir == 'U'
			? this.dotY - 1
			: dir == 'D'
				? this.dotY + 1
				: this.dotY;
		if (newX < 0 || newX >= this.dimX || newY < 0 || newY >= this.dimY)
		{
			return; // out of field
		}
		var curCell =this.field[this.dotX][this.dotY];
		var tCell = this.field[newX][newY];
		var tDirs = {'L': 'E', 'R': 'W', 'U': 'S', 'D': 'N'};
		var theresBigOrSmallThere = false;
		var theresSmallThere = false;
		if (tCell.length > 0)
		{
			var shouldBeOpen = tDirs[dir];
//			alert('should be open: ' + shouldBeOpen);
			for (i=0; i<tCell.length; i++)
			{
				if (tCell[i] == 'BL')
				{
					return; // no move to black
				}
				if (tCell[i].charAt(1) != shouldBeOpen)
				{
//					alert('elem: ' + tCell[i] +'char: ' + tCell[i].charAt(2) + " should be " + shouldBeOpen);
					return; // if at least one is not East-open
				}
				switch (tCell[i].charAt(0))
				{
				case 'S':
				case 'L':
					theresSmallThere = true;
					break;
				}
			}
			theresBigOrSmallThere = true; // what else?..
		}

		// if we could go there due to open sides, check if it is big here and big or small there
		// look what else are we to move
		var mDirs = {'L': 'W', 'R': 'E', 'U': 'N', 'D': 'S'};
		var toMove = ['DT'];
		if (curCell.length > 1)
		{
			for (i=0; i<curCell.length; i++)
			{
				if (curCell[i].charAt(1) != mDirs[dir] && curCell[i] != 'DT') // if not open there
				{
					toMove[toMove.length] = curCell[i];
				}
			}
		}
		// maybe we have little inside the big?
		var ll = toMove.length;
		for (i=0; i<ll; i++)
		{
			// if we are moving big - "target" or "big"
			if (toMove[i].charAt(0) == 'T' || toMove[i].charAt(0) == 'B')
			{
				for (j=0; j<curCell.length; j++)
				{
					// and we have small one
					if (curCell[j].charAt(0) == 'S' || curCell[j].charAt(0) == 'L')
					{
						toMove[toMove.length] = curCell[j];
					}
				}
			}
		}
		//alert('to move: ' + toMove + ' curCell' + curCell);
		var theresBigHere = false;
		var theresSmallHere = false;
		for (i=0; i<toMove.length; i++)
		{
			switch (toMove[i].charAt(0))
			{
			case 'B':
			case 'T':
				theresBigHere = true;
				break;
			case 'S':
			case 'L':
				theresSmallHere = true;
				break;
			}
		}
		if (theresBigOrSmallThere && theresBigHere)
		{
			// cant go with big to big or small
			return;
		}
		if (theresSmallThere && theresSmallHere)
		{
			return;
		}
		// ok, moving the all the stuff
		for (j=0; j<toMove.length; j++)
		{
			for (i=0; i<curCell.length; i++)
			{
				if (curCell[i] == toMove[j])
				{
					curCell.splice(i, 1);
					tCell[tCell.length] = toMove[j];
				}
			}
		}

		this.reDraw(this.dotX, this.dotY);
		this.reDraw(newX, newY);
		this.dotX = newX;
		this.dotY = newY;

		this.movesCounter ++;
		
		if (typeof this.moveFinishedHandler != "undefined")
		{
			this.moveFinishedHandler(this);
		}

		this.checkLevelEnd();
		//alert('move dx = ' + this.dotX + ' dy = ' + this.dotY);
	}

	TheGame.prototype.checkLevelEnd = function(){
//		alert('check');
		var cell = this.field[this.dotX][this.dotY];
			var subj = false;
			var targ = false;
			for (i=0; i<cell.length; i++)
			{
				if (cell[i].charAt(0) == 'S')
				{
					subj = true;
				}
				if (cell[i].charAt(0) == 'T')
				{
					targ = true;
				}
			}
			if (subj && targ)
			{
				this.endlevel();
			}
	}

// moving dot with mouse click
	TheGame.prototype.onclick = function(e){
		//alert("mc");
		var mouseX, mouseY;
		if(e.offsetX) {
			mouseX = e.offsetX;
			mouseY = e.offsetY;
		}
		else if(e.layerX) {
			mouseX = e.layerX;
			mouseY = e.layerY;
		}
		var x = Math.floor(mouseX / currGame.side);
		var y = Math.floor(mouseY / currGame.side);
		//alert("x: " + x + " y: " + y);
		// find dot in nearest cells
		var dir = 'NONE';
		if (x > 0)
		{
			// check if dot is to the left
			var cell = currGame.field[x-1][y];
			for (i=0; i<cell.length; i++)
			{
				if (cell[i] == 'DT')
				{
					dir = 'R'; // move right
				}
			}
		}
		if (x < currGame.dimX - 1)
		{
			// check if dot is to the left
			var cell = currGame.field[x+1][y];
			for (i=0; i<cell.length; i++)
			{
				if (cell[i] == 'DT')
				{
					dir = 'L'; // move right
				}
			}
		}
		if (y > 0)
		{
			// check if dot is to the left
			var cell = currGame.field[x][y-1];
			for (i=0; i<cell.length; i++)
			{
				if (cell[i] == 'DT')
				{
					dir = 'D';
				}
			}
		}
		if (y < currGame.dimY - 1)
		{
			// check if dot is to the left
			var cell = currGame.field[x][y+1];
			for (i=0; i<cell.length; i++)
			{
				if (cell[i] == 'DT')
				{
					dir = 'U'; // move right
				}
			}
		}
		//alert('dir: ' + dir);
		if (dir != 'NONE')
		{
			currGame.move(dir);
		}
	}

	
	TheGame.prototype.NextLevel = function(){
		//alert("fields: " + this.fields.length);
		if (this.currentLevel < (this.levels.length - 1))
		{
			this.currentLevel ++;
			this.SetField(this.levels[this.currentLevel]["data"]);
			this.start();
		} else {
			this.GotoLevel(0);
		}
	}

	TheGame.prototype.ResetLevel = function(){
		this.SetField(this.levels[this.currentLevel]["data"]);
		this.start();
	}
	TheGame.prototype.GotoLevel = function(l){
		if (l < this.levels.length && l >= 0)
		{
			this.currentLevel = l;
			this.SetField(this.levels[this.currentLevel]["data"]);
			this.start();
		} else {
			alert("No such level: " + l + " range: 0 - " + (this.levels.length - 1));
		}
	}

	TheGame.prototype.start = function(){
		this.stopped = false;
		this.setGridSide(100);
		this.initField();
		this.canvas.addEventListener("click", this.onclick, false);
		this.movesCounter = 0;
		if (typeof this.gameStartedHandler != "undefined")
		{
			this.gameStartedHandler(this);
		}
	}

	TheGame.prototype.endlevel = function(){
		this.drawEndLevel();
		this.stopped = true;

		var x = this;
		var kb = document.onkeydown;
		var coc = x.canvas.onclick;
		var f = function(e) {
			//alert('xxx');
			x.NextLevel();
			x.canvas.onclick = coc;
			document.onkeydown = kb;
		}
		this.canvas.onclick = f;
		document.onkeydown = f;
	}


// level load
function getXmlHttp(){
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
}

function loadLevel(levelName){
	var xmlhttp = getXmlHttp()
	xmlhttp.open('GET', levelName, false);
	xmlhttp.send(null);
	var field = new Array();
	if(xmlhttp.status == 200) {
		var text = xmlhttp.responseText;
		var lines = text.split("\n");
		//alert(lines);
		var lnnum = 0;
		for (i=0; i<lines.length; i++)
		{
			var line = lines[i];
			if (line.charAt(0) != ';') // ;... -comments
			{
				field[lnnum] = new Array();
				var chars = line.split("");
				//alert('chars: ' + chars);
				for (j=0; j<chars.length; j++)
				{
//;. - dot; cC, uU, nN, dD - black boxes (small and big); ^<>_ - subject (red box); LRMW - target (blue box)

					switch (chars[j])
					{
					case '.': field[lnnum][j] = ['DT']; break;
					case 'X': field[lnnum][j] = ['BL']; break;
					
					case 'c': field[lnnum][j] = ['LE']; break;
					case 'u': field[lnnum][j] = ['LN']; break;
					case 'n': field[lnnum][j] = ['LS']; break;
					case 'd': field[lnnum][j] = ['LW']; break;
					
					case 'C': field[lnnum][j] = ['BE']; break;
					case 'U': field[lnnum][j] = ['BN']; break;
					case 'N': field[lnnum][j] = ['BS']; break;
					case 'D': field[lnnum][j] = ['BW']; break;
					
					case '<': field[lnnum][j] = ['SE']; break;
					case '_': field[lnnum][j] = ['SN']; break;
					case '^': field[lnnum][j] = ['SS']; break;
					case '>': field[lnnum][j] = ['SW']; break;
					
					case 'R': field[lnnum][j] = ['TE']; break;
					case 'W': field[lnnum][j] = ['TN']; break;
					case 'M': field[lnnum][j] = ['TS']; break;
					case 'L': field[lnnum][j] = ['TW']; break;
					
					case '-': field[lnnum][j] = new Array(); break;
					}
				}
				lnnum ++;
			}
		}
		//alert('field: ' + field);
	} else {
		alert('Error loading ' + levelName + " st: " + xmlhttp.status);
	}
	// transpose
	if (field.length > 0)
	{
		var copy = new Array();
		for (j = 0; j < field[0].length; ++j) {
			copy[j] = new Array();
		}
		for (i = 0; i < field.length; ++i) {
			for (j = 0; j < field[0].length; ++j) {
				copy[j][i] = field[i][j];
			}
		}
		field = copy;
	}
	return field;
}

