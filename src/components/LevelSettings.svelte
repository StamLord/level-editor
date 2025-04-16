<script>
    import { exportUnit, floorHeight } from '../stores/user.js';
    import Slider from './Slider.svelte';

    let unit;
    $: unit = $exportUnit;
    $: exportUnit.set(unit);

    let height;
    $: height = $floorHeight;
    $: floorHeight.set(height);

</script>

<div>
    <div class="settings-container">
        <Slider label="Floor Height" min={1} max={20} step={0.25} bind:value={height}/>
        <Slider label="Engine Units" min={1} max={10} step={0.25} bind:value={unit}/>
    </div>
</div>