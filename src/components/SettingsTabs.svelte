<div class="side-panel right">
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
        {/if}
    </div>

    
</div>

<script>
    import PlayerSettings from "../components/PlayerSettings.svelte";
    import LevelSettings from "./LevelSettings.svelte";

    const Tab = {
    LEVEL_SETTINGS: "Level Settings",
    PLAYER_SETTINGS: "Player Settings",
    };

    let tabs = [Tab.LEVEL_SETTINGS, Tab.PLAYER_SETTINGS]

    let active = Tab.LEVEL_SETTINGS;


</script>