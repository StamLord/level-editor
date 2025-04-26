<script>
    import ColorPicker from "./ColorPicker.svelte";
    import Slider from "./Slider.svelte";

    let wallColor = "#5e5e5e";
    let wallRoughness = 0.5;
    let wallMetallic = 0.0;

    let platformColor = "#5e5e5e";
    let platformRoughness = 0.5;
    let platformMetallic = 0.0;

    let fenceColor = "#5e5e5e";
    let fenceRoughness = 0.5;
    let fenceMetallic = 0.0;

    let rampColor = "#5e5e5e";
    let rampRoughness = 0.5;
    let rampMetallic = 0.0;

    let stairsColor = "#5e5e5e";
    let stairsRoughness = 0.5;
    let stairsMetallic = 0.0;

</script>

<div class="settings-container">
    <div class="materials-container">
        <h2>Walls</h2>
        <ColorPicker label="Albedo" bind:value={wallColor}/>
        <Slider label="Roughness" min={0.0} max={1.0} step={0.01} bind:value={wallRoughness}/>
        <Slider label="Metallic" min={0.0} max={1.0} step={0.01} bind:value={wallMetallic}/>

        <h2>Platforms</h2>
        <ColorPicker label="Albedo" bind:value={platformColor}/>
        <Slider label="Roughness" min={0.0} max={1.0} step={0.01} bind:value={platformRoughness}/>
        <Slider label="Metallic" min={0.0} max={1.0} step={0.01} bind:value={platformMetallic}/>

        <h2>Fences</h2>
        <ColorPicker label="Albedo" bind:value={fenceColor}/>
        <Slider label="Roughness" min={0.0} max={1.0} step={0.01} bind:value={fenceRoughness}/>
        <Slider label="Metallic" min={0.0} max={1.0} step={0.01} bind:value={fenceMetallic}/>

        <h2>Ramps</h2>
        <ColorPicker label="Albedo" bind:value={rampColor}/>
        <Slider label="Roughness" min={0.0} max={1.0} step={0.01} bind:value={rampRoughness}/>
        <Slider label="Metallic" min={0.0} max={1.0} step={0.01} bind:value={rampMetallic}/>

        <h2>Stairs</h2>
        <ColorPicker label="Albedo" bind:value={stairsColor}/>
        <Slider label="Roughness" min={0.0} max={1.0} step={0.01} bind:value={stairsRoughness}/>
        <Slider label="Metallic" min={0.0} max={1.0} step={0.01} bind:value={stairsMetallic}/>
    </div>
</div>

<style>
    h2 {
        grid-column: span 2;
        margin: 0rem 2rem 0rem 2rem;
        border-bottom: 2px solid var(--divider-color);
    }

    .materials-container {
        display:grid;
        gap: 10px;
        width: 100%;
        grid-column:span 2; 
        max-height: 442px;
        overflow-x: hidden;
        overflow-y: scroll;
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
