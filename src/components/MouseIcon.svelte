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
