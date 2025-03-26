<script>
    export let text = "";
    let show = false;
</script>

<div
    class="tooltip-wrapper"
    role="button"
    tabindex="0"
    on:mouseenter={() => show = true} 
    on:mouseleave={() => show = false}>
    <slot></slot>
    {#if show}
        <div class="tooltip">{text}</div>
    {/if}
</div>

<style>
    .tooltip-wrapper{
        position:relative;
        display: inline-block;
    }

    .tooltip {
        position: absolute;
        bottom: 120%;
        left: 50%;
        transform: translateX(-50%);
        background-color: black;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        white-space: nowrap;
        font-size: 14px;
    }
</style>