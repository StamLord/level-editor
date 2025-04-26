<script>
    export let label = 'Albedo';
    export let value = '#ffffff';

    let colorPickerId = `color-picker-${Math.random().toString(36).slice(2, 11)}`;

</script>

<div class="color-picker">
    <label for={colorPickerId}>{label}</label>
    <input class="color-input" id={colorPickerId} type="color" bind:value={value}>
</div>

<style>
    .color-picker {
        grid-column: span 2;
        display: flex;
        align-items: center;
        flex-direction: column;
        width: 100%;
        background: none;
        border: none;
    }

    .color-input {
        width: 50%;
        height: 50px;
        border: none;
        background: none;
        transition: transform 0.2s ease;
    }

    .color-input:hover {
        transform: scale(1.1);
    }
</style>
