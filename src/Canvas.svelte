<input 
  id="fileImport"
  type="file" 
  accept=".json" 
  style="display: none;" 
  on:change={importCanvas} 
/>


<h1>Level Editor</h1>
<div class="grid-container">
  <div class="side-panel left"></div>
  <div class="center-panel">
    <div class="canvas-toolbar">
      <div class="canvas-toolbar-left">
        <Tooltip text="Not implemented">
          <button class="tool-button">Q</button>
        </Tooltip>
        <Tooltip text="Draw / Delete walls">
          <button id="wall-tool" class="tool-button" on:click={() => {switchTool(Tool.WALL)}}>W</button>
        </Tooltip>
        <Tooltip text="Draw / Delete platforms">
          <button id="platform-tool" class="tool-button" on:click={() => {switchTool(Tool.PLATFORM)}}>E</button>
        </Tooltip>
        <Tooltip text="Draw / Rotate / Delete ramps">
          <button id="ramp-tool" class="tool-button" on:click={() => {switchTool(Tool.RAMP)}}>R</button>
        </Tooltip>
        <Tooltip text="Draw / Delete fences">
          <button id="fence-tool" class="tool-button" on:click={() => {switchTool(Tool.FENCE)}}>T</button>
        </Tooltip>
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
    <!-- Level Editor -->
    <div style="width: 800px; height: 600px; overflow:hidden; position: relative; border: 2px solid white; display: {mode === Mode.EDITOR ? 'grid' : 'none'};">
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
      <div id="playtest-container">
        <iframe id="game-iframe"
            title="Playtest"
            width="800"
            height="600"
            sandbox="allow-same-origin allow-scripts allow-pointer-lock">
        </iframe>
      </div>
    </div>

  </div>
  <div class="side-panel right">
    <button
      class="switch-mode-button"
      on:click={switchMode}>
      {switchModeBtnText}
    </button>
    {#if mode === Mode.PLAYTEST}
      <h3>Player Settings</h3>
      <div id="player-settings">
        <label for="player-height-slider">Height</label>
        <input id="player-height-slider" 
            type="range"
            min="0.1"
            max="20"
            step="0.1"
            bind:value={playerHeight}>
        <input type="number" bind:value={playerHeight}>
        <label for="player-radius-slider">Radius</label>
        <input id="player-radius-slider" 
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            bind:value={playerRadius}>
        <input type="number" bind:value={playerRadius}>
        <label for="player-speed-slider">Speed</label>
        <input id="player-speed-slider" 
            type="range"
            min="0"
            max="20"
            step="0.1"
            bind:value={playerSpeed}>
        <input type="number" bind:value={playerSpeed}>
        <label for="player-sprint-speed-slider">Sprint Speed</label>
        <input id="player-sprint-speed-slider" 
            type="range"
            min="0"
            max="20"
            step="0.1"
            bind:value={playerSprintSpeed}>
        <input type="number" bind:value={playerSprintSpeed}>
        <label for="player-jump-velocity-slider">Jump Velocity</label>
        <input id="player-jump-velocity-slider" 
            type="range"
            min="0"
            max="20"
            step="0.1"
            bind:value={playerJumpVelocity}>
        <input type="number" bind:value={playerJumpVelocity}>
      </div>
    {/if}
    <label for="export-unit-slider">Engine Units</label>
    <div class="export-unit-container">
      <input id="export-unit-slider" 
        type="range" min="1"
        bind:value={exportUnit}/>
      <input id ="export-unit-input" 
        type="number" min="1"
        bind:value={exportUnit}/>
    </div>
    <button
      on:click={exportToTscn}>
      Export to Godot
    </button>
  </div>
</div>



<script>
  import Tooltip from './Tooltip.svelte';

  class Line {
    constructor(x1, y1, x2, y2) {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
      this.isHighlighted = false;
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
  }

  class Square {
    // Get start and end points and imply the rest
    constructor(x, y, width, height) {
      this.x1 = x;
      this.y1 = y;

      this.x2 = x + width;
      this.y2 = this.y1;

      this.x3 = this.x1;
      this.y3 = this.y1 + height;
      
      this.x4 = this.x1 + width;
      this.y4 = this.y1 + height;

      this.isHighlighted = false;
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
      this.x2 = x4;
      this.y3 = y4;
      
      this.x4 = x4;
      this.y4 = y4;
    }

    isPointInside(x, y) {
      const checkX = x > this.x1 && x < this.x2 || x < this.x1 && x > this.x2;
      const checkY = y > this.y1 && y < this.y4 || y < this.y1 && y > this.y4;
      return checkX && checkY;
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
  }

  const lineHighlightColor = '#ff0000';
  const lineColor = '#ffffff';
  const platformColor = '#3f3f3f';
  const platformHighlightColor = '#ff000080';

  const Mode = {
    EDITOR: 0,
    PLAYTEST: 1
  };

  let mode = Mode.EDITOR;

  const Tool = {
    MOVE: 0,
    WALL: 1,
    PLATFORM: 2,
    RAMP: 3,
    FENCE: 4,
  }

  let tool = Tool.WALL; 

  let canvas;
  let ctx;
  let floors = [{
    lines: [], 
    platforms: [],
    ramps: [],
    fences: []
  }];

  let activeFloor = 0;

  let isDrawing = false;
  let gridSize = 25;
  let zoomFactor = 1;
  let wallHeight = 4;
  
  let isPanning = false;
  let startX, startY;
  let offsetX = -2000;
  let offsetY = -2000;

  let exportUnit = 1; // Will convert grid unit (25) into 1 meter in Godot

  let playerHeight = 2;
  let playerRadius = 0.3;
  let playerSpeed = 5;
  let playerSprintSpeed = 8;
  let playerJumpVelocity = 4.5;

  import { onMount } from 'svelte';

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
        iframe.src = "/level-editor/static/LevelEditorWebApp.html";
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
      let alpha = 1;

      if (floorDelta > 0)
        alpha = Math.pow(0.5, floorDelta);
      else if (floorDelta < 0)
        alpha = 0; // Drawing above us are invisible
      
      // Draw platforms
      const pColor = setHexAlpha(platformColor, alpha * 0.5); // Platforms start with 0.5 opacity
      floor.platforms.forEach(platform => {
        ctx.fillStyle = platform.isHighlighted? platformHighlightColor : pColor;
        ctx.fillRect(platform.x1, platform.y1, platform.getWidth(), platform.getHeight());
      });

      // Draw lines
      const lColor = setHexAlpha(lineColor, alpha);
      floor.lines.forEach(line => {
        ctx.lineWidth = line.isHighlighted? 4 : 2;
        
        ctx.strokeStyle = line.isHighlighted? lineHighlightColor : lColor;
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      });
      
      // Draw fences
      ctx.setLineDash([10, 5]); 
      const fColor = setHexAlpha(lineColor, alpha);
      floor.fences.forEach(fence => {
        ctx.lineWidth = fence.isHighlighted? 4 : 2;
        
        ctx.strokeStyle = fence.isHighlighted? lineHighlightColor : fColor;
        ctx.beginPath();
        ctx.moveTo(fence.x1, fence.y1);
        ctx.lineTo(fence.x2, fence.y2);
        ctx.stroke();
      });
      ctx.setLineDash([]); 
      
      i++;
    });
    ctx.restore();
  };

  function setHexAlpha(color, alpha) {
    const _alpha = Math.round(alpha * 255);
    const alphaHex = _alpha.toString(16).padStart(2,'0');
    color += alphaHex;
    return color;
  }

  function switchFloor(floorIndex) {
    floorIndex = Math.max(0, Math.min(floorIndex, floors.length - 1));
    activeFloor = floorIndex;
    updateFloorButtons();
    drawGrid();
  }

  function addFloor() {
    floors.push({
      lines: [],
      platforms: [],
      fences: []
    });

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

      if (tool === Tool.WALL)
        floors[activeFloor].lines.push(new Line(x, y, x, y));
      else if (tool === Tool.PLATFORM)
      floors[activeFloor].platforms.push(new Square(x, y, 0, 0));
      else if (tool === Tool.FENCE)
        floors[activeFloor].fences.push(new Line(x, y, x, y));
      
      drawGrid(); 
      } // Pan
      else if (event.button === 1) {
        isPanning = true;
        startX = event.clientX;
        startY = event.clientY;
      } // Delete 
      else if (event.button === 2) {
        if (tool === Tool.WALL)
          floors[activeFloor].lines = floors[activeFloor].lines.filter(line => line.isHighlighted == false);
        else if (tool === Tool.PLATFORM)
          floors[activeFloor].platforms = floors[activeFloor].platforms.filter(platform => platform.isHighlighted == false);
        else if (tool === Tool.FENCE)
          floors[activeFloor].fences = floors[activeFloor].fences.filter(line => line.isHighlighted == false);
      drawGrid();
    }
  };

  const handleMouseMove = (event) => { 
    const mousePos = getMousePos(event);

    if (isDrawing) {
      const x = getSnapped(mousePos.x);
      const y = getSnapped(mousePos.y);
      
      if (tool === Tool.WALL) {
        const lines = floors[activeFloor].lines;
        lines[lines.length - 1].x2 = x;
        lines[lines.length - 1].y2 = y;
      } else if (tool === Tool.PLATFORM) {
        const platforms = floors[activeFloor].platforms;
        platforms[platforms.length - 1].updateSquare(x, y);
      } else if (tool === Tool.FENCE) {
        const fences = floors[activeFloor].fences;
        fences[fences.length - 1].x2 = x;
        fences[fences.length - 1].y2 = y;
      }
    } else if (isPanning) {
      offsetX += event.clientX - startX;
      offsetY += event.clientY - startY;
      startX = event.clientX;
      startY = event.clientY;
    } else {
      // Highlight
      if (tool === Tool.WALL) {
        floors[activeFloor].lines.forEach(line => {
          line.isHighlighted = line.isPointOnLine(mousePos.x, mousePos.y);});
      } else if (tool === Tool.PLATFORM) {
        floors[activeFloor].platforms.forEach(platform => {
          platform.isHighlighted = platform.isPointInside(mousePos.x, mousePos.y);});
      } else if (tool === Tool.FENCE) {
        floors[activeFloor].fences.forEach(fence => {
          fence.isHighlighted = fence.isPointOnLine(mousePos.x, mousePos.y);});
      }
    }
    drawGrid();
  };

  const handleMouseUp = (event) => {
    if (event.button === 0) {
      isDrawing = false;
      const lines = floors[activeFloor].lines;
      if (lines.length > 0 && lines[lines.length - 1].isPoint())
        lines.pop();
    } else if (event.button === 1) {
      isPanning = false;
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  }

  const handleMouseWheel = (event) => {
    event.preventDefault();
    if (event.deltaY < 0) {
      zoomFactor *= 1.25;
    }
    else if (event.deltaY > 0) {
      zoomFactor /= 1.25;
    }

    zoomFactor = Math.min(Math.max(zoomFactor, 0.25), 5);
  }

  const handleKeydown = (event) => {
    const key = event.key;
    
    // ctrl + s exports the canvas
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      exportCanvas();
    }

    // Numbers switch floors
    const num = Number(key);
    if (!isNaN(num)) {
      if (num == 0)
        switchFloor(9);
      else
        switchFloor(num - 1);
    }

    // q,w,e,r switch tools
    else if (key === 'w')
      switchTool(Tool.WALL);
    else if (key === 'e')
      switchTool(Tool.PLATFORM);
    else if (key === 'r')
      switchTool(Tool.RAMP);
    else if (key === 't')
      switchTool(Tool.FENCE);
  }

  const clearCanvas = () => {
    floors.forEach(floor => {
      floor.lines = [];
      floor.platforms = [];
      floor.fences = [];
    });

    drawGrid();
  }

  const exportCanvas = () => {
    const blob = new Blob([JSON.stringify(floors)], { type: 'application/json' });
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
        const floorsData = JSON.parse(e.target.result);
        floors = floorsData.map(floor => ({
          lines: floor.lines.map(line => new Line(line.x1, line.y1, line.x2, line.y2)),
          platforms: floor.platforms.map(platform => new Square(platform.x1, platform.y1, platform.x2 - platform.x1, platform.y4 - platform.y1)),
          fences: floor.fences.map(fence => new Line(fence.x1, fence.y1, fence.x2, fence.y2))
        }));
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
        const engineScale = exportUnit / gridSize;
        const x = (line.x1 + line.x2) * 0.5 * engineScale;
        const y = (wallHeight * j) + (wallHeight * 0.5);
        const z = (line.y1 + line.y2) * 0.5 * engineScale;
        const name = `wall_${i}`;
        
        const length = line.getLength() * engineScale;
        const angle = line.getAngle();

        // Sub resources
        let boxRandomId = Math.random().toString(36).substring(2, 7); // 5-char random ID
        sub_resources += `[sub_resource type="BoxShape3D" id="BoxShape3D_${boxRandomId}"]\n`;
        sub_resources += `size = Vector3(${length}, ${wallHeight}, ${thickness})\n\n`;

        let quadRandomId = Math.random().toString(36).substring(2, 7); // 5-char random ID
        sub_resources += `[sub_resource type="QuadMesh" id="QuadMesh_${quadRandomId}"]\n`;
        sub_resources += `size = Vector2(${length}, ${wallHeight})\n\n`;

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
    console.log("Clicked playtest")
    sendRequest();
    sendRequest();
    mode = 1;
    switchModeBtnText = "To Editor";
  }

  function toEditor() {
    mode = 0;
    switchModeBtnText = "Playtest";
  }

  function switchTool(newTool) {
    if (isDrawing) return false; // Prevent switching tools mid drawing

    const oldTool = getToolButton(tool);
    if (oldTool != undefined)
      oldTool.classList.remove('active');

    tool = newTool;

    const curTool = getToolButton(tool);
    if (curTool != undefined)
      curTool.classList.add('active');
    
    floors[activeFloor].lines.map(line => line.isHighlighted = false);
    floors[activeFloor].platforms.map(line => line.isHighlighted = false);

    return true;
  }

  function getToolButton(toolId) {
    if (toolId === Tool.WALL)
      return document.getElementById('wall-tool');
    else if (toolId === Tool.PLATFORM)
      return document.getElementById('platform-tool');
    else if (toolId === Tool.RAMP)
      return document.getElementById('ramp-tool');
    else if (toolId === Tool.FENCE)
      return document.getElementById('fence-tool');
  }

  function getLinesData() {
    return {
      'scale': exportUnit / gridSize,
      'floors': floors,
      'height': wallHeight
    };
  }

  function getPlayerData() {
    return {
      'height': playerHeight,
      'radius': playerRadius,
      'speed': playerSpeed,
      'sprint_speed': playerSprintSpeed,
      'jump_velocity': playerJumpVelocity
    };
  }

  async function sendRequest() {
    try {
      const response = await fetch('http://localhost:8080/level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: "cors",
        body: JSON.stringify(getLinesData()) // Send data as JSON
      });

      // Handle the response
      if (response.ok) {
        console.log(`Success: ${response.status}`);
      } else {
        console.log(`Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`Request failed: ${error.message}`);
    }
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

  $: gridSize, zoomFactor, drawGrid();
</script>

