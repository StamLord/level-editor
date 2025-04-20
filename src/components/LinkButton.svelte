<script>
    export let link = '';
    export let text = '';
    function openNewTab() {
        window.open(link, '_blank');
            }
</script>

<button class='nav-button' on:click={openNewTab}>{text}</button>

<style>
    .nav-button {
        border-radius: 0px;
        border: 1px solid transparent;
        padding: 0.6em 1.2em;
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        background-color: var(--button-bg);
        cursor: pointer;
        transition: border-color 0.25s;
    }

    .nav-button:hover {
        border-radius: 0px;
        border: 1px solid transparent;
        padding: 0.6em 1.2em;
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        background-color: var(--accent-color);
        cursor: pointer;
        transition: background-color 0.25s;
    }
</style>
