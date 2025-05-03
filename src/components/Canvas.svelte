<input 
  id="fileImport"
  type="file" 
  accept=".json" 
  style="display: none;" 
  on:change={importCanvas} 
/>

<div class="grid-container">
  <div class="side-panel left">
    <ToolSettings/>
    <ToolInfo/>
  </div>
  <div class="center-panel">
    <div class="canvas-toolbar">
      <div class="canvas-toolbar-left">
        <ToolButton text="Q" key="q" toolType={ToolType.SELECT}/>
        <ToolButton text="W" key="w" toolType={ToolType.WALL}/>
        <ToolButton text="E" key="e" toolType={ToolType.PLATFORM}/>
        <ToolButton text="R" key="r" toolType={ToolType.RAMP}/>
        <ToolButton text="T" key="t" toolType={ToolType.FENCE}/>
        <ToolButton text="S" key="s" toolType={ToolType.STAIRS}/>
      </div>
      <div class="canvas-toolbar-right">
        <button
          on:click={clearCanvas}>
          Clear
        </button>
        <button
          on:click={exportCanvas}>
          Export
        </button>
        <button
          on:click={triggerFileImport}>
          Import
        </button>
      </div>
    </div>
    <div style="width: 800px; height: 600px; overflow:hidden; position: relative; border: 2px solid var(--text-color);">
      <!-- Level Editor -->
      <div class="canvas-container" style="display: {mode === Mode.EDITOR ? 'grid' : 'none'};">
        <div id="canvas-floors">
          <button on:click={addFloor}> + </button>
          <button class="floor-button"> 1 </button>
        </div>
        <canvas bind:this={canvas} width="4000" height="4000" 
            on:mousedown={handleMouseDown} 
            on:mousemove={handleMouseMove} 
            on:mouseup={handleMouseUp} 
            on:wheel={handleMouseWheel}
            on:contextmenu={handleContextMenu}
            style="border: 1px solid black; position: relative; z-index: 10;">
        </canvas>
      </div>
      <!-- Playtest -->
      <div style= "display: {mode === Mode.PLAYTEST ? 'block' : 'none'}">
        <iframe id="game-iframe"
            title="Playtest"
            width="800"
            height="600"
            sandbox="allow-same-origin allow-scripts allow-pointer-lock">
        </iframe>
      </div>
    </div>
    <div class="exports-container">
      <button class="export-button" disabled>
        Export to Unreal
      </button>
      <button class="export-button"
        on:click={exportToTscn}>
        Export to Godot
      </button>
      <button class="export-button" disabled>
        Export to Unity
      </button>
    </div>
  </div>
  <div class="side-panel right">
    <button
    class="switch-mode-button"
    on:click={switchMode}>
      {#if mode === Mode.EDITOR}
        <div class="play-icon"></div>
      {:else}
        <div class="pause-icon"></div>
      {/if}
      <!-- {switchModeBtnText} -->
    </button>
   
    <SettingsTabs />

  </div>
</div>

<script>
  import ToolButton from './ToolButton.svelte';
  import ToolInfo from './ToolInfo.svelte';
  import { ToolType, Tool } from '../data/tools.js'
  import SettingsTabs from './SettingsTabs.svelte';
  import { currentTool, wallThickness, fenceThickness } from '../stores/user';
  import { playerHeight, playerRadius, playerSpeed, playerSprintSpeed, playerJumpVelocity } from '../stores/user';
  import { exportUnit, floorHeight } from '../stores/user';
  import { wallMaterial, platformMaterial, fenceMaterial, rampMaterial, stairsMaterial } from '../stores/user.js';
  import { mount, onMount } from 'svelte';
  import { getFloorData } from '../data/floorData';
  import ToolSettings from './ToolSettings.svelte';
  import LoadingBar from './LoadingBar.svelte';

  class BaseData {
    constructor() {
      this.isHighlighted = false;
      this.isSelected = false;
    }
  }

  class Line extends BaseData {
    constructor(x1, y1, x2, y2, thickness) {
      super();
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
      this.thickness = thickness;
    }

    move(x, y) {
      this.x1 += x;
      this.x2 += x;
      this.y1 += y;
      this.y2 += y;
    }

    isPoint() {
      return this.x1 === this.x2 && this.y1 === this.y2;
    }

    getLength() {
      return Math.sqrt((this.x2 - this.x1) ** 2 + (this.y2 - this.y1) ** 2);
    }

    isPointOnLine(x, y) {
      const len = this.getLength();
      // Project point (px, py) onto the line and clamp to the segment
      const t = Math.max(0, Math.min(1, ((x - this.x1) * (this.x2 - this.x1) + (y - this.y1) * (this.y2 - this.y1)) / (len * len)));

      // Find the closest point on the line
      const closestX = this.x1 + t * (this.x2 - this.x1);
      const closestY = this.y1 + t * (this.y2 - this.y1);

      const dist = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
      
      return dist <= 5;
    }

    getAngle() {
      const dx = this.x2 - this.x1;
      const dy = this.y2 - this.y1;
      
      let angle = Math.atan2(dx, dy) - Math.PI / 2; // Radians adjusted for 'up' being 0
      
      //angle = angle * (180 / Math.PI) + 90; // Convert to degrees and adjust for 'up' being 0 degrees
      
      //if (angle < 0) angle += 360; // Normalize between 0-360 degrees
      
      return angle;
    }

    clone() {
      return new Line(this.x1, this.y1, this.x2, this.y2, this.thickness);
    }
  }

  class Square extends BaseData {
    // Get start and end points and imply the rest
    constructor(x, y, width, height) {
      super();
      this.x1 = x;
      this.y1 = y;

      this.x2 = x + width;
      this.y2 = this.y1;

      this.x3 = this.x1;
      this.y3 = this.y1 + height;
      
      this.x4 = this.x1 + width;
      this.y4 = this.y1 + height;
    }

    getWidth() {
      return this.x2 - this.x1;
    }

    getHeight() {
      return this.y4 - this.y1;
    }

    move(x, y) {
      this.x1 += x;
      this.x2 += x;
      this.x3 += x;
      this.x4 += x;

      this.y1 += y;
      this.y2 += y;
      this.y3 += y;
      this.y4 += y;
    }

    updateSquare(x4, y4) {
      if (this.x1 != x4) {
        this.x2 = x4;
        this.x4 = x4;
      }

      if (this.y1 != y4) {
        this.y3 = y4;
        this.y4 = y4;
      }
    }

    fixSquare() {
      if (this.x1 > this.x2 || this.x1 > this.x4) {
        let tmp = this.x1;
        this.x1 = this.x2;
        this.x2 = tmp;
        this.x3 = this.x1;
        this.x4 = this.x2;
      }

      if (this.y1 > this.y3 || this.y1 > this.y4) {
        let tmp = this.y1;
        this.y1 = this.y3;
        this.y3 = tmp;
        this.y2 = this.y1;
        this.y4 = this.y3;
      }
    }

    isPointInside(x, y) {
      const checkX = x > this.x1 && x < this.x2 || x < this.x1 && x > this.x2;
      const checkY = y > this.y1 && y < this.y4 || y < this.y1 && y > this.y4;
      return checkX && checkY;
    }

    getCenter() {
      return {
        x: (this.x1 + this.x2) * 0.5,
        y: (this.y1 + this.y4) * 0.5,
      }
    }

    // A square is inverted vertically if it is drawn from bottom to top
    isInvertedVertically() {
      return this.y4 < this.y1;
    }

     // A square is inverted horizontally if it is drawn from right to left
     isInvertedHorizontally() {
      return this.x2 < this.x1;
    }

    clone() {
      return new Square(this.x1, this.y1, this.getWidth(), this.getHeight());
    }
  }

  class Ramp extends Square {

    static Direction = {
      UP: 0,
      RIGHT: 1,
      DOWN: 2,
      LEFT: 3
    }

    constructor(x, y, width, height, direction = 0) {
      super(x, y, width, height);
      this.direction = direction;
    }

    rotate() {
      this.direction++;
      this.direction %= Object.keys(Ramp.Direction).length;
    }

    isVertical() {
      return this.direction === Ramp.Direction.UP || this.direction === Ramp.Direction.DOWN;
    }

    isHorizontal() {
      return this.direction === Ramp.Direction.LEFT || this.direction === Ramp.Direction.RIGHT;
    }

    getLength() {
      return (this.isVertical())? this.getHeight() : this.getWidth();
    }

    clone() {
      return new Ramp(this.x1, this.y1, this.getWidth(), this.getHeight(), this.direction);
    }
  }

  class Stairs extends Ramp {
    constructor(x, y, width, height, direction = 0) {
      super(x, y, width, height, direction);
    }

    clone() {
      return new Stairs(this.x1, this.y1, this.getWidth(), this.getHeight(), this.direction);
    }
  }

  class Selection {
    constructor(x1, y1, x4, y4) {
      this.x1 = x1;
      this.y1 = y1;

      this.x4 = x4;
      this.y4 = y4;

      this.x2 = this.x4;
      this.y2 = this.y1;

      this.x3 = this.x1;
      this.y3 = this.y4;
    }

    move(x, y) {
      this.x1 += x;
      this.x2 += x;
      this.x3 += x;
      this.x4 += x;

      this.y1 += y;
      this.y2 += y;
      this.y3 += y;
      this.y4 += y;
    }

    getWidth() {
      return this.x2 - this.x1;
    }

    getHeight() {
      return this.y4 - this.y1;
    }

    updateCorner(x4, y4) {
      this.x4 = x4;
      this.y4 = y4;

      this.x2 = this.x4;
      this.y3 = this.y4;
    }

    isPointInside(x, y) {
      const checkX = x > this.x1 && x < this.x2 || x < this.x1 && x > this.x2;
      const checkY = y > this.y1 && y < this.y4 || y < this.y1 && y > this.y4;
      return checkX && checkY;
    }

    isObjectInside(object) {
      if (object instanceof Line)
        return this.isPointInside(object.x1, object.y1) && this.isPointInside(object.x2, object.y2) 
      else if (object instanceof Square)
        return this.isPointInside(object.x1, object.y1) && this.isPointInside(object.x2, object.y2) && this.isPointInside(object.x3, object.y3) && this.isPointInside(object.x4, object.y4); 
    }

    clone() {
      return new Selection(this.x1, this.y1, this.x4, this.y4);
    }
  }

  const selectionColor = '#3399FF80';
  const passiveSelectionColor = '#3399FF';
  const lineHighlightColor = '#ff0000';
  const lineColor = '#ffffff';
  const platformColor = '#3f3f3f';
  const platformHighlightColor = '#ff000080';
  const rampColor = '#3f3f3f';
  const rampHighlightColor = '#00ff0080';

  const Mode = {
    EDITOR: 0,
    PLAYTEST: 1
  };

  let mode = Mode.EDITOR;

  let canvas;
  let ctx;

  const floorKeys = ['lines', 'platforms', 'ramps', 'fences', 'stairs'];

  let floors = [getFloorData()];

  let activeFloor = 0;

  let isDrawing = false;
  let gridSize = 25;
  let zoomFactor = 1;
  
  let isPanning = false;
  let startX, startY;
  let offsetX = -2000;
  let offsetY = -2000;

  const SelectionState = {
    NONE: 0,
    ACTIVE: 1,
    PASSIVE: 2,
    MOVING: 3
  }

  let selectionState = SelectionState.NONE;
  let selectionRect = new Selection(-100, -100);
  let selectionData = getFloorData();
  let moveSelectionStartX;
  let moveSelectionStartY;

  let copiedSelectionRect = null; // For drawing the same selection rect without computation
  let copiedSelectionData = getFloorData();

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext("2d");
      drawGrid();
    }

    window.addEventListener("keydown", handleKeydown);

    // Global function for Godot to fetch
    window.getLinesData = () => {
      return JSON.stringify(getLinesData())
    };

    window.getPlayerData = () => {
      return JSON.stringify(getPlayerData())
    };

  });

  onMount(() => {
    const iframe = document.getElementById("game-iframe");
    
    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {

          mount(LoadingBar, {target:document.body});
          
          iframe.src = "/static/LevelEditorWebApp.html";
          observer.disconnect();
        }
    });

    observer.observe(iframe);

    updateFloorButtons();
    });

  const drawGrid = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(offsetX, offsetY);
    ctx.scale(zoomFactor, zoomFactor); 

    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.25;

    // Draw grid lines at intervals of `gridSize`
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    let i = 0;
    floors.forEach(floor => {
      // Reduce alpha below us by 50% for every floor
      const floorDelta = activeFloor - i;
      let alpha = 1.0;

      if (floorDelta > 0)
        alpha = Math.pow(0.5, floorDelta);
      else if (floorDelta < 0)
        alpha = 0.0; // Drawing above us are invisible
      
      // Draw platforms
      const pColor = setHexAlpha(platformColor, alpha * 0.5); // Platforms start with 0.5 opacity
      floor.platforms.forEach(platform => {
        ctx.fillStyle = platform.isSelected? selectionColor : platform.isHighlighted? platformHighlightColor : pColor;
        ctx.fillRect(platform.x1, platform.y1, platform.getWidth(), platform.getHeight());
      });
      
      // Draw ramps
      const rColor = setHexAlpha(rampColor, alpha * 0.5); // Platforms start with 0.5 opacity
      const rArrowColor = setHexAlpha(rampColor, alpha * 1.1); // TODO: Switch to rgba() to avoid alpha bugs. '* 1.1' needed for correct value

      floor.ramps.forEach(ramp => {
        let fillStyle = ramp.isSelected? selectionColor : ramp.isHighlighted? rampHighlightColor : rColor;
        let strokeStyle = ramp.isSelected? selectionColor : ramp.isHighlighted? rampHighlightColor : rArrowColor;
        drawRamp(ctx, ramp, fillStyle, strokeStyle);
      });

      // Draw lines
      const lColor = setHexAlpha(lineColor, alpha);
      floor.lines.forEach(line => {
        drawLine(ctx, line, line.isHighlighted? 1.25 : 1, line.isSelected? selectionColor : line.isHighlighted? lineHighlightColor : lColor);});

      // Draw fences
      const fColor = setHexAlpha(lineColor, alpha);
      floor.fences.forEach(fence => {
        drawLine(ctx, fence, fence.isHighlighted? 1.25 : 1, fence.isSelected? selectionColor : fence.isHighlighted? lineHighlightColor :fColor, [10, 5]);});

      // Draw stairs
      const sColor = setHexAlpha(rampColor, alpha * 0.5); // Platforms start with 0.5 opacity
      floor.stairs.forEach(stair => {
        let fillStyle = stair.isSelected? selectionColor : stair.isHighlighted? rampHighlightColor : sColor;
        let strokeStyle = stair.isSelected? selectionColor : stair.isHighlighted? rampHighlightColor : rArrowColor;
        drawStairs(ctx, stair, fillStyle, strokeStyle);
      });

      // Draw Selection
      if (selectionState !== SelectionState.NONE) {
        ctx.save();
        ctx.beginPath();
        if (selectionState === SelectionState.ACTIVE) {
          ctx.fillStyle = selectionColor;
          ctx.setLineDash([]); 
          ctx.fillRect(selectionRect.x1, selectionRect.y1, selectionRect.getWidth(), selectionRect.getHeight());
        }
        else {
          ctx.strokeStyle = passiveSelectionColor;
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 5]); 
          ctx.rect(selectionRect.x1, selectionRect.y1, selectionRect.getWidth(), selectionRect.getHeight());
        }

        ctx.stroke();
        ctx.restore();
      }

      i++;
    });

    ctx.restore();
  };

  function drawLine(context, line, widthMult, color, dash=[]) {
    context.save();

    context.lineWidth = line.thickness * gridSize * widthMult;
    context.setLineDash(dash);
    context.strokeStyle = color;

    context.beginPath();
    context.moveTo(line.x1, line.y1);
    context.lineTo(line.x2, line.y2);
    context.stroke();

    context.restore();
  }

  function drawRamp(context, ramp, fillStyle, strokeStyle) {
    context.save();
    context.fillStyle = fillStyle;
    context.strokeStyle = strokeStyle;
    context.fillRect(ramp.x1, ramp.y1, ramp.getWidth(), ramp.getHeight());

    // Draw arrow
    const center = ramp.getCenter();
    const margins = ramp.getLength() * 0.25; // 50% of the length, divided by 2 to account for offest from center
    const arrowHeadHeight = margins * 0.5;
    const arrowHeadWidth = margins * 0.5;
    
    let direction = ramp.direction;
    
    if (ramp.isInvertedVertically()) {
      if (direction === Ramp.Direction.UP)
        direction = Ramp.Direction.DOWN;
      else if (direction === Ramp.Direction.DOWN)
        direction = Ramp.Direction.UP;
    }
    
    if (ramp.isInvertedVertically()) {
      if (direction === Ramp.Direction.RIGHT)
        direction = Ramp.Direction.LEFT;
      else if (direction === Ramp.Direction.LEFT)
        direction = Ramp.Direction.RIGHT;
    }

    if (direction === Ramp.Direction.UP || direction === Ramp.Direction.DOWN) {
      // Vertical Line
      context.beginPath();
      context.moveTo(center.x, center.y - margins);
      context.lineTo(center.x, center.y + margins);
      
      // Arrow Head
      const arrowEnd = direction === Ramp.Direction.DOWN? arrowHeadHeight : -arrowHeadHeight;
      const arrowTip = direction === Ramp.Direction.DOWN? margins : -margins;
      context.moveTo(center.x, center.y + arrowTip);
      context.lineTo(center.x - arrowHeadWidth, center.y + arrowEnd);
      context.moveTo(center.x, center.y + arrowTip);
      context.lineTo(center.x + arrowHeadWidth, center.y + arrowEnd);
    } else {
      // Horizontal line
      context.beginPath();
      context.moveTo(center.x - margins, center.y);
      context.lineTo(center.x + margins, center.y);

      // Arrow Head
      const xOffest = direction === Ramp.Direction.RIGHT? arrowHeadHeight : -arrowHeadHeight;
      const xStart = direction === Ramp.Direction.RIGHT? margins : -margins;
      context.moveTo(center.x + xStart, center.y);
      context.lineTo(center.x + xOffest, center.y + arrowHeadWidth);
      context.moveTo(center.x + xStart, center.y);
      context.lineTo(center.x + xOffest, center.y - arrowHeadWidth);
    }

    context.lineWidth = 4;
    context.stroke();
    context.restore();
  }

  function drawStairs(context, stair, fillStyle, strokeStyle) {
    drawRamp(context, stair, fillStyle, strokeStyle);
    context.save();
    context.fillStyle = fillStyle;
    context.strokeStyle = strokeStyle;

    const lineAmount = $floorHeight / 0.25; // Number of steps needed to get to next floor
    
    context.lineWidth = 0.5;

    // Vertical lines for horizontal ramp
    if (stair.direction === Ramp.Direction.LEFT || stair.direction === Ramp.Direction.RIGHT) {
      const lineInterval = stair.getWidth() / lineAmount;

      for(let i = 0; i < lineAmount; i++) {
        const x = stair.x1 + lineInterval * i;
        context.moveTo(x, stair.y1);
        context.lineTo(x, stair.y4);
      }

      const lastX = stair.x1 + lineInterval * lineAmount;
      context.moveTo(lastX, stair.y1);
      context.lineTo(lastX, stair.y4);
    } else { // Horizontal lines for vartical ramp
      const lineInterval = stair.getHeight() / lineAmount;

      for(let i = 0; i < lineAmount; i++) {
        const y = stair.y1 + lineInterval * i;
        context.moveTo(stair.x1, y);
        context.lineTo(stair.x2, y);
      }

      const lastY = stair.y1 + lineInterval * lineAmount;
      context.moveTo(stair.x1, lastY);
      context.lineTo(stair.x2, lastY);
    }

    context.stroke();
    context.restore();
  }

  function setHexAlpha(color, alpha) {
    const _alpha = Math.round(alpha * 255);
    const alphaHex = _alpha.toString(16).padStart(2,'0');
    color += alphaHex;
    return color;
  }

  function switchFloor(floorIndex) {
    deHighlightAll();
    floorIndex = Math.max(0, Math.min(floorIndex, floors.length - 1));
    activeFloor = floorIndex;
    updateFloorButtons();
    drawGrid();
  }

  function addFloor() {
    floors.push(getFloorData());

    updateFloorButtons();
  }

  function updateFloorButtons() {
    const floorAmount = floors.length;

    const buttons = document.getElementsByClassName("floor-button");
    let buttonsAmount = buttons.length;

    const container = document.getElementById("canvas-floors");

    while (buttonsAmount > floorAmount) {
      container.removeChild(container.lastChild);
      buttonsAmount--;
    }
    
    for (let i = 0; i < floorAmount; i++) {
      let btn;
      if (i < buttonsAmount)
        btn = container.children[i + 1];
      else {
        btn = document.createElement("button");
        btn.className = "floor-button";
        container.appendChild(btn);
      }

      btn.textContent = `${floorAmount - i}`;
      btn.onclick = () => switchFloor(floorAmount - i - 1);
      
      if (floorAmount - i - 1=== activeFloor)
        btn.classList.add("active");
      else
        btn.classList.remove("active");
    }
  }

  const getSnapped = (pos) => Math.round(pos / gridSize) * gridSize;

  function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offsetX) / zoomFactor;
    const y = (event.clientY - rect.top - offsetY) / zoomFactor;
    return {x, y};
  }

  const handleMouseDown = (event) => {
    event.preventDefault();
    const mousePos = getMousePos(event);
    
    // Draw
    if (event.button === 0) {
      const x = getSnapped(mousePos.x);
      const y = getSnapped(mousePos.y);
      isDrawing = true;

      if ($currentTool === Tool.SELECT) {
        if (selectionState === SelectionState.NONE) {
          selectionRect = new Selection(mousePos.x, mousePos.y, mousePos.x, mousePos.y);
          selectionState = SelectionState.ACTIVE;
        }
        else {
          const isInsideSelection = selectionRect.isPointInside(x, y);
          if (isInsideSelection) {
            moveSelectionStartX = x;
            moveSelectionStartY = y;
            selectionState = SelectionState.MOVING;
          } else {
            selectionRect = new Selection(mousePos.x, mousePos.y, mousePos.x, mousePos.y);
            clearSelectionData();
            selectionState = SelectionState.ACTIVE;
          }
        }
      }
      else if ($currentTool === Tool.WALL)
        floors[activeFloor].lines.push(new Line(x, y, x, y, $wallThickness));
      else if ($currentTool === Tool.PLATFORM)
        floors[activeFloor].platforms.push(new Square(x, y, 0, 0));
      else if ($currentTool === Tool.RAMP) {
        const highlighted = floors[activeFloor].ramps.filter(ramp => ramp.isHighlighted); 
        if (highlighted.length > 0) {
          isDrawing = false; // Prevent editing last ramp
          highlighted.map(ramp => ramp.rotate());
        } else
          floors[activeFloor].ramps.push(new Ramp(x, y, 0, 0));
      }
      else if ($currentTool === Tool.FENCE)
        floors[activeFloor].fences.push(new Line(x, y, x, y, $fenceThickness));
      else if ($currentTool === Tool.STAIRS) {
        const highlighted = floors[activeFloor].stairs.filter(stair => stair.isHighlighted); 
        if (highlighted.length > 0) {
          isDrawing = false; // Prevent editing last stair
          highlighted.map(stair => stair.rotate());
        } else
          floors[activeFloor].stairs.push(new Stairs(x, y, 0, 0));
      }
      
      drawGrid(); 
      } // Pan
      else if (event.button === 1) {
        isPanning = true;
        startX = event.clientX;
        startY = event.clientY;
      } // Delete 
      else if (event.button === 2) {
        if ($currentTool === Tool.WALL)
          floors[activeFloor].lines = floors[activeFloor].lines.filter(line => line.isHighlighted == false);
        else if ($currentTool === Tool.PLATFORM)
          floors[activeFloor].platforms = floors[activeFloor].platforms.filter(platform => platform.isHighlighted == false);
        else if ($currentTool === Tool.RAMP)
          floors[activeFloor].ramps = floors[activeFloor].ramps.filter(ramp => ramp.isHighlighted == false);
        else if ($currentTool === Tool.FENCE)
          floors[activeFloor].fences = floors[activeFloor].fences.filter(line => line.isHighlighted == false);
        else if ($currentTool === Tool.STAIRS)
          floors[activeFloor].stairs = floors[activeFloor].stairs.filter(stair => stair.isHighlighted == false);
      drawGrid();
    }
  };

  const handleMouseMove = (event) => { 
    const mousePos = getMousePos(event);

    if (isDrawing) {
      const x = getSnapped(mousePos.x);
      const y = getSnapped(mousePos.y);
      
      if ($currentTool === Tool.SELECT) {
        if (selectionState === SelectionState.MOVING)
          moveSelectionData(x, y);
        else if (selectionState === SelectionState.ACTIVE)
          selectionRect.updateCorner(mousePos.x, mousePos.y);
      } else if ($currentTool === Tool.WALL) {
        const lines = floors[activeFloor].lines;
        lines[lines.length - 1].x2 = x;
        lines[lines.length - 1].y2 = y;
      } else if ($currentTool === Tool.PLATFORM) {
        const platforms = floors[activeFloor].platforms;
        platforms[platforms.length - 1].updateSquare(x, y);
      } else if ($currentTool === Tool.RAMP) {
        const ramps = floors[activeFloor].ramps;
        ramps[ramps.length - 1].updateSquare(x, y);
      } else if ($currentTool === Tool.FENCE) {
        const fences = floors[activeFloor].fences;
        fences[fences.length - 1].x2 = x;
        fences[fences.length - 1].y2 = y;
      } else if ($currentTool === Tool.STAIRS) {
        const stairs = floors[activeFloor].stairs;
        stairs[stairs.length - 1].updateSquare(x, y);
      }
    } else if (isPanning) {
      offsetX += event.clientX - startX;
      offsetY += event.clientY - startY;
      startX = event.clientX;
      startY = event.clientY;
    } else {
      // Highlight
      if ($currentTool === Tool.WALL) {
        floors[activeFloor].lines.forEach(line => {
          line.isHighlighted = line.isPointOnLine(mousePos.x, mousePos.y);});
      } else if ($currentTool === Tool.PLATFORM) {
        floors[activeFloor].platforms.forEach(platform => {
          platform.isHighlighted = platform.isPointInside(mousePos.x, mousePos.y);});
      } else if ($currentTool === Tool.RAMP) {
        floors[activeFloor].ramps.forEach(ramp => {
          ramp.isHighlighted = ramp.isPointInside(mousePos.x, mousePos.y);});
      } else if ($currentTool === Tool.FENCE) {
        floors[activeFloor].fences.forEach(fence => {
          fence.isHighlighted = fence.isPointOnLine(mousePos.x, mousePos.y);});
      } else if ($currentTool === Tool.STAIRS) {
        floors[activeFloor].stairs.forEach(stair => {
          stair.isHighlighted = stair.isPointInside(mousePos.x, mousePos.y);});
      } 
    }
    drawGrid();
  };

  const handleMouseUp = (event) => {
    if (event.button === 0) {
      isDrawing = false;
      
      if ($currentTool === Tool.SELECT) {
        if (selectionState === SelectionState.MOVING)
          selectionState = SelectionState.PASSIVE;
        else if(selectionState === SelectionState.ACTIVE) {
          getSelectionData();
          
          if (isSelectionDataEmpty())
            selectionState = SelectionState.NONE;
          else
            selectionState = SelectionState.PASSIVE;
        }

        drawGrid();
      }

      // TODO: Refactor 'fixes' per tool
      const lines = floors[activeFloor].lines;
      if (lines.length > 0 && lines[lines.length - 1].isPoint())
        lines.pop();

      // Fix inverted squares
      const platforms = floors[activeFloor].platforms;
      const ramps = floors[activeFloor].ramps;
      const stairs = floors[activeFloor].stairs;

      if (platforms.length > 0)
        platforms[platforms.length - 1].fixSquare();

      if (ramps.length > 0)
        ramps[ramps.length - 1].fixSquare();

      if (stairs.length > 0)
        stairs[stairs.length - 1].fixSquare();

    } else if (event.button === 1) {
      isPanning = false;
    } else if (event.button === 2) {
      if ($currentTool === Tool.SELECT) {
        if (selectionState !== SelectionState.NONE) {
          selectionState = SelectionState.NONE;
          clearSelectionData();
          drawGrid();
        }
      }
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  }

  const handleMouseWheel = (event) => {
    event.preventDefault();

    const preZoomMousePos = getMousePos(event);

    if (event.deltaY < 0) {
      zoomFactor *= 1.25;
    }
    else if (event.deltaY > 0) {
      zoomFactor /= 1.25;
    }

    zoomFactor = Math.min(Math.max(zoomFactor, 0.25), 5);

    const postZoomMousePos = getMousePos(event);

    const deltaX = postZoomMousePos.x - preZoomMousePos.x;
    const deltaY = postZoomMousePos.y - preZoomMousePos.y;

    offsetX += deltaX * zoomFactor;
    offsetY += deltaY * zoomFactor;

  }

  const handleKeydown = (event) => {
    const key = event.key;
    
    
    if (event.ctrlKey) {
      // ctrl + s exports the canvas
      if (event.key === "s") {
        event.preventDefault();
        exportCanvas();
      }

      // ctrl + c copies selection
      if (event.key === "c" && $currentTool === Tool.SELECT) {
        event.preventDefault();
        copySelectionData();
      }

      // ctrl + v pastes selection
      if (event.key === "v" && $currentTool === Tool.SELECT) {
        event.preventDefault();
        pasteSelectionData();
      }
    }

    // Numbers switch floors
    const num = Number(key);
    if (!isNaN(num)) {
      if (num == 0)
        switchFloor(9);
      else
        switchFloor(num - 1);
    }
  }

  const clearCanvas = () => {
    floors.forEach(floor => {
      floor.lines = [];
      floor.platforms = [];
      floor.ramps = [];
      floor.fences = [];
      floor.stairs = [];
    });

    drawGrid();
  }

  const exportCanvas = () => {
    const blob = new Blob([JSON.stringify(getLinesData())], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'level.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  const importCanvas = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        clearCanvas();
        const levelData = JSON.parse(e.target.result);

        $floorHeight = levelData.height;
        
        $wallMaterial.albedo = levelData.wallMaterial.albedo;
        $wallMaterial.roughness = levelData.wallMaterial.roughness;
        $wallMaterial.metallic = levelData.wallMaterial.metallic;

        $platformMaterial.albedo = levelData.platformMaterial.albedo;
        $platformMaterial.roughness = levelData.platformMaterial.roughness;
        $platformMaterial.metallic = levelData.platformMaterial.metallic;

        $fenceMaterial.albedo = levelData.fenceMaterial.albedo;
        $fenceMaterial.roughness = levelData.fenceMaterial.roughness;
        $fenceMaterial.metallic = levelData.fenceMaterial.metallic;

        $rampMaterial.albedo = levelData.rampMaterial.albedo;
        $rampMaterial.roughness = levelData.rampMaterial.roughness;
        $rampMaterial.metallic = levelData.rampMaterial.metallic;

        $stairsMaterial.albedo = levelData.stairsMaterial.albedo;
        $stairsMaterial.roughness = levelData.stairsMaterial.roughness;
        $stairsMaterial.metallic = levelData.stairsMaterial.metallic;

        floors = levelData.floors.map(floor => ({
          lines: floor.lines.map(line => new Line(line.x1, line.y1, line.x2, line.y2, line.thickness)),
          platforms: floor.platforms.map(platform => new Square(platform.x1, platform.y1, platform.x2 - platform.x1, platform.y4 - platform.y1)),
          fences: floor.fences.map(fence => new Line(fence.x1, fence.y1, fence.x2, fence.y2, fence.thickness)),
          ramps: floor.ramps.map(ramp => new Ramp(ramp.x1, ramp.y1, ramp.x2 - ramp.x1, ramp.y4 - ramp.y1, ramp.direction)),
          stairs: floor.stairs.map(stair => new Stairs(stair.x1, stair.y1, stair.x2 - stair.x1, stair.y4 - stair.y1, stair.direction)),
        }));
        updateFloorButtons();
        drawGrid();
      };
      reader.readAsText(file);
    }
  }

  const exportToTscn = async () => {
    // Scene header
    let tscnContent = `[gd_scene load_steps=3 format=3 uid="uid://c1fwaxlu5nadd"]\n\n`;

    const materialId = "StandardMaterial3D_nmni2";

    const thickness = 0.25;
    
    let sub_resources = ""; // Text containing sub resources
    let nodes = "";         // Text containing nodes
    let i = 0;  // Object number
    let j = 0; // Floor number
    floors.forEach(floor => {
      floor.lines.forEach(line => {
        const engineScale = $exportUnit / gridSize;
        const x = (line.x1 + line.x2) * 0.5 * engineScale;
        const y = ($floorHeight * j) + ($floorHeight * 0.5);
        const z = (line.y1 + line.y2) * 0.5 * engineScale;
        const name = `wall_${i}`;
        
        const length = line.getLength() * engineScale;
        const angle = line.getAngle();

        // Sub resources
        let boxRandomId = Math.random().toString(36).substring(2, 7); // 5-char random ID
        sub_resources += `[sub_resource type="BoxShape3D" id="BoxShape3D_${boxRandomId}"]\n`;
        sub_resources += `size = Vector3(${length}, ${$floorHeight}, ${thickness})\n\n`;

        let quadRandomId = Math.random().toString(36).substring(2, 7); // 5-char random ID
        sub_resources += `[sub_resource type="QuadMesh" id="QuadMesh_${quadRandomId}"]\n`;
        sub_resources += `size = Vector2(${length}, ${$floorHeight})\n\n`;

        // StaticBody3D
        nodes += `[node name="${name}" type="StaticBody3D" parent="."]\n`;
        nodes += `transform = Transform3D(${Math.cos(angle)}, 0, ${Math.sin(angle)}, 0, 1, 0, ${-Math.sin(angle)}, 0, ${Math.cos(angle)}, ${x}, ${y}, ${z})\n\n`;
        
        // Collision shape
        nodes += `[node name="CollisionShape3D" type="CollisionShape3D" parent="${name}"]\n`;
        nodes += `shape = SubResource("BoxShape3D_${boxRandomId}")\n\n`;

        // MeshInstance
        nodes += `[node name="MeshInstance3D" type="MeshInstance3D" parent="${name}"]\n`;
        nodes += `material_override = SubResource("${materialId}")`;
        nodes += `mesh = SubResource("QuadMesh_${quadRandomId}")\n`;
        nodes += `skeleton = NodePath("../..")\n\n`;

        i++;
      });
      j++;
    });

    // Floor resources
    tscnContent += `[sub_resource type="PlaneMesh" id="PlaneMesh_17dxa"]\n`;
    tscnContent += `size = Vector2(2000, 2000)\n\n`;
    tscnContent += `[sub_resource type="BoxShape3D" id="BoxShape3D_yp7xd"]\n`;
    tscnContent += `size = Vector3(2000, 0.25, 2000)\n\n`;
    
    // Wall resources
    tscnContent += `[sub_resource type="StandardMaterial3D" id="${materialId}"]\n`;
    tscnContent += `cull_mode = 2\n\n`;

    tscnContent += sub_resources;
    tscnContent += `[node name="Level" type="Node3D"]\n\n`; // Root
    
    // Add floor
    tscnContent += `[node name="floor" type="StaticBody3D" parent="."]\n\n`;
    tscnContent += `[node name="MeshInstance3D" type="MeshInstance3D" parent="floor"]\n`;
    tscnContent += `transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 1000, 0, 1000)\n`;
    tscnContent += `mesh = SubResource("PlaneMesh_17dxa")\n\n`;
    tscnContent += `[node name="CollisionShape3D" type="CollisionShape3D" parent="floor"]\n`;
    tscnContent += `transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 1000, 0, 1000)\n`;
    tscnContent += `shape = SubResource("BoxShape3D_yp7xd")\n\n`;

    tscnContent += nodes;

    const blob = new Blob([tscnContent]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'scene.tscn';
    link.click();
  }

  function switchMode() {
    if (mode === Mode.EDITOR)
      playtest();
    else
      toEditor();
  }
  
  let switchModeBtnText = "Playtest";
  
  function playtest() {
    mode = 1;
    switchModeBtnText = "To Editor";
  }

  function toEditor() {
    mode = 0;
    switchModeBtnText = "Playtest";
  }

  function switchTool() {
    if (isDrawing) return false; // Prevent switching tools mid drawing

    deHighlightAll();
    drawGrid();
  }

  function deHighlightAll() {
    floors[activeFloor].lines.forEach(line => line.isHighlighted = false);
    floors[activeFloor].platforms.forEach(platform => platform.isHighlighted = false);
    floors[activeFloor].fences.forEach(fence => fence.isHighlighted = false);
    floors[activeFloor].ramps.forEach(ramp => ramp.isHighlighted = false);
    floors[activeFloor].stairs.forEach(stair => stair.isHighlighted = false);
  }

  function getToolButton(toolId) {
    if (toolId === Tool.SELECT)
      return document.getElementById('select-tool');
    else if (toolId === Tool.WALL)
      return document.getElementById('wall-tool');
    else if (toolId === Tool.PLATFORM)
      return document.getElementById('platform-tool');
    else if (toolId === Tool.RAMP)
      return document.getElementById('ramp-tool');
    else if (toolId === Tool.FENCE)
      return document.getElementById('fence-tool');
    else if (toolId === Tool.STAIRS)
      return document.getElementById('stairs-tool');
  }

  function getLinesData() {
    return {
      'scale': $exportUnit / gridSize,
      'floors': floors,
      'height': $floorHeight,
      'wallMaterial': $wallMaterial,
      'platformMaterial': $platformMaterial,
      'fenceMaterial': $fenceMaterial,
      'rampMaterial': $rampMaterial,
      'stairsMaterial': $stairsMaterial,
    };
  }

  function getPlayerData() {
    return {
      'height': $playerHeight,
      'radius': $playerRadius,
      'speed': $playerSpeed,
      'sprint_speed': $playerSprintSpeed,
      'jump_velocity': $playerJumpVelocity
    };
  }

  function triggerFileImport() {
    document.getElementById('fileImport').click();
  }

  function captureMouse(canvas) {
      canvas.requestPointerLock =
          canvas.requestPointerLock ||
          canvas.mozRequestPointerLock ||
          canvas.webkitRequestPointerLock;
      if (canvas.requestPointerLock) {
          canvas.requestPointerLock();
      }
  }

  function getSelectionData() {
    if (selectionRect === null) return;
    
    markSelectedObjects(false);

    selectionData.lines = floors[activeFloor].lines.filter(l => selectionRect.isObjectInside(l));
    selectionData.platforms = floors[activeFloor].platforms.filter(p => selectionRect.isObjectInside(p));
    selectionData.ramps = floors[activeFloor].ramps.filter(r => selectionRect.isObjectInside(r));
    selectionData.fences = floors[activeFloor].fences.filter(f => selectionRect.isObjectInside(f));
    selectionData.stairs = floors[activeFloor].stairs.filter(s => selectionRect.isObjectInside(s));
    
    markSelectedObjects();
  }

  function isSelectionDataEmpty() {
    return selectionData.lines.length < 1 && selectionData.platforms.length < 1
        && selectionData.ramps.length < 1 && selectionData.fences.length < 1 && selectionData.stairs.length < 1;
  }

  function markSelectedObjects(isSelected = true) {
    selectionData.lines.forEach(x => x.isSelected = isSelected);
    selectionData.platforms.forEach(x => x.isSelected = isSelected);
    selectionData.ramps.forEach(x => x.isSelected = isSelected);
    selectionData.fences.forEach(x => x.isSelected = isSelected);
    selectionData.stairs.forEach(x => x.isSelected = isSelected);
  }

  function resetSelectionData() {
    selectionData = getFloorData();
  }

  function clearSelectionData() {
    markSelectedObjects(false);
    resetSelectionData();
  }

  function moveSelectionData(x, y) {
    const deltaX = x - moveSelectionStartX;
    const deltaY = y - moveSelectionStartY;

    selectionData.lines.forEach(x => x.move(deltaX, deltaY));
    selectionData.platforms.forEach(x => x.move(deltaX, deltaY));
    selectionData.ramps.forEach(x => x.move(deltaX, deltaY));
    selectionData.fences.forEach(x => x.move(deltaX, deltaY));
    selectionData.stairs.forEach(x => x.move(deltaX, deltaY));

    selectionRect.move(deltaX, deltaY);
    moveSelectionStartX = x;
    moveSelectionStartY = y;
  }

  function copySelectionData() {
    copiedSelectionRect = selectionRect.clone();

    for (const key of floorKeys) {
      copiedSelectionData[key] = selectionData[key].map(data => data.clone());
    }
  }

  function pasteSelectionData() {
    // TODO: Better way to detect copy buffer
    if (copiedSelectionRect === null)
      return;
    
    clearSelectionData();

    // Draw new selection rect from copy
    selectionRect = copiedSelectionRect.clone();
    selectionState = SelectionState.PASSIVE;

    // Add copied data to floor + selection
    const floor = floors[activeFloor];
    
    for (const key of floorKeys) {
      copiedSelectionData[key].forEach(data => {
        const newData = data.clone()
        floor[key].push(newData); 
        selectionData[key].push(newData);
      })
    }

    markSelectedObjects();
  }

  $: gridSize, zoomFactor, drawGrid();
</script>

