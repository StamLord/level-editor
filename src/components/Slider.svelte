<script>
    export let label = 'slider';
    export let min = 0;
    export let max = 100;
    export let step = 1;
    export let value;

    let sliderId = `slider-${Math.random().toString(36).slice(2, 11)}`;

</script>

<label for={sliderId}>{label}</label>
<input
    id={sliderId}
    type="range"
    min={min}
    max={max}
    step={step}
    bind:value={value}>
<input type="number" bind:value={value}>