<script>
  import LinkButton from "./LinkButton.svelte";
</script>

<header>
    <div class="icon">🧱</div>
    <div class="logo"> LevelForge</div>
    <nav>
      <div class="nav-left">
        <!-- <button class="nav-button">File</button> -->
      </div>
      <div class="nav-right">
        <LinkButton text="☕ Buy Me a Coffee" link="https://buymeacoffee.com/philip.grach"/>
        <LinkButton text="💡 Leave a Suggestion" link="https://docs.google.com/forms/d/e/1FAIpQLSeNaHLzdSS5fEi2IAAc5a8ENb0xir8lOD7Axro6NIfYB0HrAA/viewform?usp=sharing"/>
        <button class="nav-button">Help</button>
      </div>
    </nav>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    background-color: var(--button-bg);
    margin-bottom: 4rem;
  }

  header nav {
    margin-left: 2rem;
    display: flex;
    justify-content: space-between;
    flex: 1;
  }

  .icon {
    margin-left: 1rem;
    font-size: 28px;
  }

  .logo {
    font-family: 'Jersey 15', sans-serif;
    font-size: 30px;
    margin-left: 0.5rem;

    background: linear-gradient(
    90deg,
    #646cff,
    #fa7900,
    #646cff
    ) left/200% 100%;
    background-repeat: repeat;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    animation: scroll-gradient 3s linear infinite;
  }

  @keyframes scroll-gradient {
    to {
      background-position: 200% 0;
    }
  }

  .nav-button {
    border-radius: 0px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: var(--button-bg);
    cursor: pointer;
    transition: border-color 0.25s;
  }

  .nav-button:hover {
    border-radius: 0px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: var(--accent-color);
    cursor: pointer;
    transition: background-color 0.25s;
  }
</style>