<script>
    import ColorPicker from "./ColorPicker.svelte";
    import Slider from "./Slider.svelte";
    import { wallMaterial, platformMaterial, fenceMaterial, rampMaterial, stairsMaterial } from '../stores/user.js';

</script>

<div class="settings-container">
    <div class="materials-container">
        <h2>Walls</h2>
        <ColorPicker label="Albedo" bind:value={$wallMaterial.albedo}/>
        <Slider label="Roughness" min={0.0} max={1.0} step={0.01} bind:value={$wallMaterial.roughness}/>
        <Slider label="Metallic" min={0.0} max={1.0} step={0.01} bind:value={$wallMaterial.metallic}/>

        <h2>Platforms</h2>
        <ColorPicker label="Albedo" bind:value={$platformMaterial.albedo}/>
        <Slider label="Roughness" min={0.0} max={1.0} step={0.01} bind:value={$platformMaterial.roughness}/>
        <Slider label="Metallic" min={0.0} max={1.0} step={0.01} bind:value={$platformMaterial.metallic}/>

        <h2>Fences</h2>
        <ColorPicker label="Albedo" bind:value={$fenceMaterial.albedo}/>
        <Slider label="Roughness" min={0.0} max={1.0} step={0.01} bind:value={$fenceMaterial.roughness}/>
        <Slider label="Metallic" min={0.0} max={1.0} step={0.01} bind:value={$fenceMaterial.metallic}/>

        <h2>Ramps</h2>
        <ColorPicker label="Albedo" bind:value={$rampMaterial.albedo}/>
        <Slider label="Roughness" min={0.0} max={1.0} step={0.01} bind:value={$rampMaterial.roughness}/>
        <Slider label="Metallic" min={0.0} max={1.0} step={0.01} bind:value={$rampMaterial.metallic}/>

        <h2>Stairs</h2>
        <ColorPicker label="Albedo" bind:value={$stairsMaterial.albedo}/>
        <Slider label="Roughness" min={0.0} max={1.0} step={0.01} bind:value={$stairsMaterial.roughness}/>
        <Slider label="Metallic" min={0.0} max={1.0} step={0.01} bind:value={$stairsMaterial.metallic}/>
    </div>
</div>

<style>
    h2 {
        grid-column: span 2;
        margin: 0rem 2rem 0rem 2rem;
        border-bottom: 2px solid var(--divider-color);
    }

    .materials-container {
        max-height: 442px;
        overflow-x: hidden;
        overflow-y: scroll;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .materials-container::-webkit-scrollbar {
        width: 4px;
    }

    .materials-container::-webkit-scrollbar-track {
        background: #2c2c2c;
    }

    .materials-container::-webkit-scrollbar-thumb {
        background: #555;
        border-radius: 4px;
    }

    .materials-container::-webkit-scrollbar-thumb:hover {
        background: #777;
    }
</style>
