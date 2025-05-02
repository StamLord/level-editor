<script>
    export let label = 'slider';
    export let min = 0;
    export let max = 100;
    export let step = 1;
    export let value;
    export let numberStyle = '';
    export let rangeStyle = '';
    export let row = false;

    let sliderId = `slider-${Math.random().toString(36).slice(2, 11)}`;

</script>

<div class="slider-container" class:row-direction={row}>
    <label for={sliderId}>{label}</label>
    <div class="slider-input">
        <input
            id={sliderId}
            class="slider"
            type="range"
            style={rangeStyle} 
            min={min}
            max={max}
            step={step}
            bind:value={value}>
        <input class="number" type="number" style={numberStyle} bind:value={value} step={step}>
    </div>
</div>

<style>
    :root {
        --input-bg: #444;
    }

    .slider-container {
        display:flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }

    .row-direction {
        flex-direction: row;
    }

    .slider-input {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        gap: 10px;
    }

    .slider {
        appearance: none;
        height: 6px;
        transform: translateY(8px);
        background: var(--input-bg);
        border-radius: 8px;
    }

    .slider::-webkit-slider-thumb {
        appearance: none;
        width: 14px;
        height: 14px;
        background: var(--text-color);
        border-radius: 50%;
        cursor: pointer;
    }

    .number {
        background: var(--input-bg);
        border: 1px solid transparent;
        color: var(--text-color);
        border-radius: 8px;
        text-align: center;
        width: 50px;
    }
</style>
