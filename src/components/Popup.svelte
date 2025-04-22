<script>
    export let visible = false;
</script>

{#if visible}
    <div class="popup-bg" on:click={() => {
        if(visible){visible = false;}}}>
        <div class="popup" on:click|stopPropagation>
            <slot></slot>
        </div>
    </div>
{/if}

<style>
    .popup-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        align-content: center;
        z-index: 1000;
    }

    .popup {
        background: var(--panel-color);
        padding: 0.5rem 2rem;
        overflow-y: auto;
        margin: auto;
        border-radius: 12px;
        max-width: 500px;
        height: 75%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        text-align: left;
        z-index: 2000;
    }
</style>
