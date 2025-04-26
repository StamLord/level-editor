<script>
    import PlayerSettings from "../components/PlayerSettings.svelte";
    import LevelSettings from "./LevelSettings.svelte";
    import MaterialSettings from "./MaterialSettings.svelte";

    const Tab = {
    LEVEL_SETTINGS: "Level",
    PLAYER_SETTINGS: "Player",
    MATERIAL_SETTINGS: "Materials",
    };

    let tabs = [Tab.LEVEL_SETTINGS, Tab.PLAYER_SETTINGS, Tab.MATERIAL_SETTINGS]

    let active = Tab.LEVEL_SETTINGS;

</script>

<div class="tabs-container">
    <div class="tabs">
        {#each tabs as tab}
            <button
                class:active={tab === active}
                on:click={() => active = tab}>
                {tab}
            </button>
        {/each}
    </div>

    <div class="tab-content">
        {#if active === Tab.PLAYER_SETTINGS}
            <PlayerSettings/>
        {:else if active === Tab.LEVEL_SETTINGS}
            <LevelSettings/>
        {:else if active === Tab.MATERIAL_SETTINGS}
            <MaterialSettings/>
        {/if}
    </div>

    
</div>

<style>
    .tabs-container {
        overflow: hidden;
        background-color: var(--panel-color);
        border-radius: 8px;
        
    }

    .tabs {
        display: flex;
    }
  
    .tabs button {
        flex: 1;
        background-color: var(--button-bg);
        padding: 0.5rem 1rem;
        border: 0px;
        border-radius: 0%;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        transition: background-color 0.25s;
    }

    .tabs button:hover {
        background-color: var(--accent-color);
        transition: background-color 0.25s;
    }

    .tabs button.active {
        background-color: var(--panel-color);
    }

    .tab-content {
        padding: 1rem 0;
        width: 280px;
    }
    
</style>
