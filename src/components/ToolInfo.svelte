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
                {:else if tip.button == "ctrl+c"}
                    <div class="btn-combo"><div class="btn">CTRL</div> + <div class="btn">C</div></div>
                {:else if tip.button == "ctrl+v"}
                    <div class="btn-combo"><div class="btn">CTRL</div> + <div class="btn">V</div></div>
                {/if}
                <p>{tip.text}</p>
            </row>
        {/each}
    </div>
</div>

<style>
    .tool-info {
        background-color: var(--panel-color);
        height: 28rem;
        border-radius: 8px;
        padding: 1rem;
        padding-top: 0;
        min-width: 200px;
    }

    .info-content {
        display: grid;
    }

    h3 {
        padding-bottom:1rem; 
        border-bottom: 2px solid var(--divider-color);
    }

    row {
        display: flex;
    }

    .btn-combo {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        /* width: 25px; */
        height: 12px;
        padding: 0.75rem;
        margin: 0.25rem;
        background-color: var(--button-bg);
        border-radius: 8px;
        line-height: 1;
    }
</style>