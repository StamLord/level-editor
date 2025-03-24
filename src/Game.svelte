<script>
    import { onMount } from "svelte";

    onMount(() => {
        const iframe = document.getElementById("game-iframe");
        iframe.src = "../static/LevelEditorWebApp.html";
    });
</script>

<iframe id="game-iframe"
    width="800"
    height="600"
    style="border: none;">
</iframe>