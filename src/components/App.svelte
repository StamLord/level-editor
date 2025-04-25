<script>
  import svelteLogo from '../assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Header from './Header.svelte';
  import Canvas from './Canvas.svelte'
  import Game from './Game.svelte';

  const umamiUrl = import.meta.env.VITE_UMAMI_URL;
  const umamiWebsiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
</script>

<svelte:head>
  <script defer src={`${umamiUrl}/script.js`} data-website-id={umamiWebsiteId}></script>
</svelte:head>

<Header/>
<main>
  <Canvas />
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
