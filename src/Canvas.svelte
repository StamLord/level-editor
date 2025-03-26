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
        <button>Q</button>
        <button>W</button>
        <button>E</button>
        <button>R</button>
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
    <div style="width: 800px; height: 600px; overflow:hidden; position: relative; border: 2px solid white; display: {mode === 0 ? 'grid' : 'none'};">
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
    <div style= "display: {mode === 1 ? 'block' : 'none'}">
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
    <label for="export-unit-slider">Engine Units</label>
    <div class="export-unit-container">
      <input id="export-unit-slider" 
        type="range" min="1" value="1"
        on:input={setEngineUnitsFromSlider}/>
      <input id ="export-unit-input" 
        type="number" min="1"
        on:input={setEngineUnitsFromInput}/>
    </div>
    <button
      on:click={exportToTscn}>
      Export to Godot
    </button>
    <button
      on:click={switchMode}>
      {switchModeBtnText}
    </button>
    <button>
      Test
    </button>
  </div>
</div>



<script>
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

  const lineHighlightColor = '#ff0000';
  const lineColor = '#ffffff';

  let mode = 0; // 0: Editor, 1: Playtest

  let canvas;
  let ctx;
  let floors = [{'lines': []}];
  let active_floor = 0;

  let isDrawing = false;
  let gridSize = 25;
  let zoomFactor = 1;
  let wallHeight = 4;
  
  let isPanning = false;
  let startX, startY;
  let offsetX = 0;
  let offsetY = 0;

  let exportUnit = 1; // Will convert grid unit (25) into 1 meter in Godot

  import { onMount } from 'svelte';

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext("2d"); // Get the 2D context
      drawGrid(); // Now you can safely call drawGrid
    }

    window.getLinesData = () => {
      return JSON.stringify(getLinesData())
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

    // Draw the drawn lines
    floors.forEach((floor) => {
      floor.lines.forEach((line) => {
        ctx.lineWidth = line.isHighlighted? 4 : 2;
        ctx.strokeStyle = line.isHighlighted? lineHighlightColor : lineColor;
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      })
    });
    ctx.restore();
  };

  function switchFloor(floorIndex) {
    active_floor = floorIndex;
    console.log(`Switched floor to ${floorIndex}`);
  }

  function addFloor() {
    floors.push({
      'lines': []
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
      if (i < buttonsAmount) {
        container.children[i + 1].textContent = `${floorAmount - i}`;
        container.children[i + 1].onclick = () => switchFloor(floorAmount - i - 1);
      }
      else {
        let btn = document.createElement("button");
        btn.textContent = `${floorAmount - i}`;
        btn.className = "floor-button";
        btn.onclick = () => switchFloor(floorAmount - i - 1);
        container.appendChild(btn);
      }
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
    
    if (event.button === 0) {
      const x = getSnapped(mousePos.x);
      const y = getSnapped(mousePos.y);
      isDrawing = true;
      floors[active_floor].lines.push(new Line(x, y, x, y));
      drawGrid(); }
      else if (event.button === 1) {
        isPanning = true;
        startX = event.clientX;
        startY = event.clientY;
    } else if (event.button === 2) {
      floors[active_floor].lines = floors[active_floor].lines.filter(line => line.isHighlighted == false);
      drawGrid();
    }

  };

  const handleMouseMove = (event) => { 
    const mousePos = getMousePos(event);

    if (isDrawing) {
      const x = getSnapped(mousePos.x);
      const y = getSnapped(mousePos.y);
      const lines = floors[active_floor].lines;
      lines[lines.length - 1].x2 = x;
      lines[lines.length - 1].y2 = y;
    } else if (isPanning) {
      offsetX += event.clientX - startX;
      offsetY += event.clientY - startY;
      startX = event.clientX;
      startY = event.clientY;
    } else {
      // Highlight
      floors[active_floor].lines.forEach(line => {
        line.isHighlighted = line.isPointOnLine(mousePos.x, mousePos.y);
      });
    }
    drawGrid();
  };

  const handleMouseUp = (event) => {
    if (event.button === 0) {
      isDrawing = false;
      const lines = floors[active_floor].lines;
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

  const clearCanvas = () => {
    floors.forEach(floor => {
      floor.lines = [];
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
        floors = floorsData.map(floor => ({lines: floor.lines.map(line => new Line(line.x1, line.y1, line.x2, line.y2))}));
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
    const y = wallHeight * 0.5; // Offset from ground level
    
    let sub_resources = ""; // Text containing sub resources
    let nodes = "";         // Text containing nodes
    let i = 0;
    
    floors.forEach(floor => floor.lines.forEach(line => {
      const engineScale = exportUnit / gridSize;
      const x = (line.x1 + line.x2) * 0.5 * engineScale;
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
    }));

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
    if (mode === 0)
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

  function getLinesData() {
    return {
      'scale': exportUnit / gridSize,
      'floors': floors,
      'height': wallHeight
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

  function setEngineUnitsFromSlider() {
    const exportUnitSlider = document.getElementById('export-unit-slider');
    const exportUnitInput = document.getElementById('export-unit-input');
    exportUnit = exportUnitSlider.value;
    exportUnitInput.value = exportUnitSlider.value;
  }

  function setEngineUnitsFromInput() {
    const exportUnitSlider = document.getElementById('export-unit-slider');
    const exportUnitInput = document.getElementById('export-unit-input');
    exportUnit = exportUnitInput.value;
    exportUnitSlider.value = exportUnitInput.value;
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

