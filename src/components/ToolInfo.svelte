<script>
    import MouseIcon from "./MouseIcon.svelte";
    import { currentTool } from '../stores/user';
    import { tools } from '../data/tools.js';

    $: toolData = tools[$currentTool];
</script>

<div class="tool-info">
    <div class="info-content">
        <h3>{toolData.name}</h3>
        {#each toolData.tips as tip}
            <row>
                {#if tip.button == "lmb"}
                    <MouseIcon leftActive={true} scale={0.5}/> 
                {:else if tip.button == "rmb"}
                    <MouseIcon rightActive={true} scale={0.5}/> 
                {/if}
                <p>{tip.text}</p>
            </row>
        {/each}
    </div>
</div>

<style>
    .tool-info {
        padding-left: 4rem; 
        padding: 4rem; 
        padding-top: 0; 
        height: 30rem;
    }

    .info-content {
        display: grid;
    }

    h3 {
        padding-bottom:1rem; 
        border-bottom: 2px solid #ccc;
    }

    row {
        display: flex;
    }
</style>