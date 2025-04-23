<script>
    import { playerHeight, playerRadius, playerSpeed, playerSprintSpeed, playerJumpVelocity } from '../stores/user.js';
    import { metrics } from '../data/metrics.js';
    import Slider from './Slider.svelte';
    
    let height, radius, speed, sprintSpeed, jumpVelocity;

    $: height = $playerHeight;
    $: playerHeight.set(height);

    $: radius = $playerRadius;
    $: playerRadius.set(radius);

    $: speed = $playerSpeed;
    $: playerSpeed.set(speed);

    $: speed = $playerSpeed;
    $: playerSpeed.set(speed);

    $: sprintSpeed = $playerSprintSpeed;
    $: playerSprintSpeed.set(sprintSpeed);

    $: jumpVelocity = $playerJumpVelocity;
    $: playerJumpVelocity.set(jumpVelocity);

    let selected;
    function handleSelection() {
        height = metrics[selected].height;
        radius = metrics[selected].radius;
        speed = metrics[selected].speed;
        sprintSpeed = metrics[selected].sprintSpeed;
        jumpVelocity = metrics[selected].jumpVelocity;
    }

</script>

<div>
    <div class="settings-container">
        <select name="metrics" id="metrics" bind:value={selected} on:change={handleSelection}>
            {#each Object.entries(metrics) as [key, options]}
                <option value="{key}">{key}</option>
            {/each}
        </select>

        <Slider label="Height" min={1} max={4} step={0.1} bind:value={height}/>
        <Slider label="Radius" min={0.1} max={1} step={0.1} bind:value={radius}/>
        <Slider label="Speed" min={0} max={20} step={0.1} bind:value={speed}/>
        <Slider label="Sprint Speed" min={0} max={20} step={0.1} bind:value={sprintSpeed}/>
        <Slider label="Jump Velocity" min={0} max={20} step={0.1} bind:value={jumpVelocity}/>
    </div>
</div>

<style>
    #metrics {
        grid-column: span 2;
        margin: 0 auto;
    }
</style>
