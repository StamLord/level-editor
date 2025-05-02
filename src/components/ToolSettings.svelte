<script>
    import { currentTool, wallThickness, fenceThickness } from '../stores/user';
    import { toolInfo } from "../data/tools.js";
    import Slider from './Slider.svelte';
</script>

<div class="tool-settings-container">
    <h3>Settings</h3>
    {#each toolInfo[$currentTool].settings as setting }
        <div class="settings">
        {#if setting.type === "slider"}
            {#if setting.variable === "wallThickness"}
                <Slider 
                    label={setting.label} 
                    min={setting.min} 
                    max={setting.max} 
                    step={setting.step} 
                    bind:value={$wallThickness}
                    rangeStyle="width:70px; margin-left: 1rem;"
                    row={true}/>
            {:else if setting.variable === "fenceThickness"}
                <Slider 
                    label={setting.label} 
                    min={setting.min} 
                    max={setting.max} 
                    step={setting.step} 
                    bind:value={$fenceThickness}
                    rangeStyle="width:70px; margin-left: 1rem;"
                    row={true}/>
            {/if}
        {/if}
        </div>
    {/each}
</div>

<style>
    .tool-settings-container {
        background-color: var(--panel-color);
        height: 10rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        padding: 1rem;
        padding-top: 0;
    }

    .settings {
        display:flex; 
        gap: 10px;
        width: 100px; 
        box-sizing: border-box;
    }

    h3 {
        padding-bottom:1rem; 
        border-bottom: 2px solid var(--divider-color);
    }
</style>
