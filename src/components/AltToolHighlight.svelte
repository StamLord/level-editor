<script>
    export let tools = [""];
    export let active = 0;
    
    const showDuration = 1000; // 1 sec
    let visible = false;
    let timeoutId;

    export function show() {
        visible = true;
        clearTimeout(timeoutId); // restart the timer if already running
        timeoutId = setTimeout(() => visible = false, showDuration);
    }

</script>

<div class="alt-tool-container"
    class:show={visible}>
    {#each tools as tool}
        <div 
            class="alt-tool-item" 
            class:active={tools[active] === tool}>
            {tool}
        </div>
    {/each}
</div>

<style>
.alt-tool-container {
    position: absolute;
    z-index: 1000;
    transform: translateY(50px);
    background-color: var(--panel-color);
    display: flex;
    flex-direction: column;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.alt-tool-container.show {
    opacity: 1;
}

.alt-tool-item {
    padding: 0.2rem 1rem 0.2rem 1rem;
}

.alt-tool-item.active {
    background: var(--button-bg) ;
}
</style>
