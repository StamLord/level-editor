<script>
    import {playerHeight, playerRadius, playerSpeed, playerSprintSpeed, playerJumpVelocity} from '../stores/user.js';
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

</script>

<div>
    <div class="settings-container">
        <Slider label="Height" min={1} max={20} step={0.1} bind:value={height}/>
        <Slider label="Radius" min={0.1} max={10} step={0.1} bind:value={radius}/>
        <Slider label="Speed" min={0} max={20} step={0.1} bind:value={speed}/>
        <Slider label="Sprint Speed" min={0} max={20} step={0.1} bind:value={sprintSpeed}/>
        <Slider label="Jump Velocity" min={0} max={20} step={0.1} bind:value={jumpVelocity}/>
    </div>
</div>