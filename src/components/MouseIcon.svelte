<script>
    export let leftActive = false;
    export let rightActive = false;
    export let scale = 1.0;
</script>

<div class="wrapper" style="transform:scale({scale})">
    <div class="mouse-icon">
        <div class="button left {leftActive? 'active' : ''}"></div>
        <div class="button right {rightActive? 'active' : ''}"></div>
        <div class="wheel"></div>
    </div>
</div>

<style>
    .mouse-icon {
        overflow: hidden;
        position: relative;
        width: 40px;
        height: 60px;
        background: var(--mouse-icon-bg);
        border: 2px solid var(--text-color);
        border-radius: 20px;
        box-sizing: border-box;
    }

    /* Common button styling */
    .mouse-icon .button {
        position: absolute;
        width: 50%;
        height: 50%;
        top: -10%;
        background: var(--mouse-icon-bg);
        box-sizing: border-box;
    }

    /* Left vs Right button positioning */
    .mouse-icon .button.left  { left: 0%;  }
    .mouse-icon .button.right { right: 0%; }

    .mouse-icon .button.active { background-color: var(--text-color); }

    /* Scroll wheel (middle click) */
    .mouse-icon .wheel {
        position: absolute;
        width: 6px;
        height: 10px;
        top: 7%;
        left: 50%;
        transform: translateX(-50%);
        background: var(--mouse-icon-bg);
        border: 2px solid var(--text-color);
        border-radius: 3px;
    }
</style>