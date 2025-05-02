<script>
    import { currentTool } from '../stores/user';
    import AltToolHighlight from "./AltToolHighlight.svelte";
    import { toolInfo } from "../data/tools.js";
    import { onMount } from "svelte";
    
    export let toolType;
    export let text;
    export let key;

    let toolButtonId = `tool-btn-${Math.random().toString(36).slice(2, 11)}`;
    let altToolRef;

    function switchTool() {
        if (toolType.tools.length > 1)
            toolType.active = (toolType.active + 1) % toolType.tools.length;
        
        // altToolRef.show();
        $currentTool = getActiveTool();
    }

    function getActiveTool() {
        return toolType.tools[toolType.active];
    }

    function getToolNames() {
        return toolType.tools.map(id => toolInfo[id].name);
    }

    onMount(() => { window.addEventListener("keydown", handleKeydown); })

    function handleKeydown(event){
        if (event.key.toLowerCase() === key)
            switchTool();
    }

</script>

 <div class="tool-button-container">
    <!-- <AltToolHighlight bind:this={altToolRef} tools={getToolNames()} active={toolType.active}/> -->
    <button id={toolButtonId} 
        class="tool-button" 
        class:active={getActiveTool() === $currentTool}
        on:click={switchTool}>
        {text}
    </button>
</div>

<style>
    .tool-button-container {
        width: 50px;
    }

    .tool-button {
        width: 50px;
        display: flex;
        justify-content: center;
        background-color: var(--button-bg);
    }

    .tool-button.active {
        background-color: var(--accent-color);
    }
</style>
