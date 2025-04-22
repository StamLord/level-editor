<script>
  import LinkButton from "./LinkButton.svelte";
  import Popup from "./Popup.svelte";

  let isPopupVisible = false;

  function showPopup() {
    isPopupVisible = true;
  }
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
        <button class="nav-button" on:click={showPopup}>❓ Help</button>
      </div>
    </nav>
</header>

<Popup bind:visible={isPopupVisible}>
  <h3>What is <big class="logo" style="margin:0.2rem;">LevelForge</big>?</h3>
  <p>
    LevelForge is a web-app for quickly designing and prototyping game levels.
    It’s lightweight, fast, and built to streamline your creative process.
  </p>

  <h3>Who is it for?</h3>
  <p>
    LevelForge is made for game developers and level designers who want to iterate quickly, refine their layouts, and share ideas with others.<br><br>
    While it includes an embedded Godot engine preview and supports exporting to `.tscn` format, LevelForge aims to be an engine-agnostic tool for level designers.
  </p>

  <h3>How do I use it?</h3>
  <p>
    Use the <strong class="btn">Q</strong><strong class="btn">W</strong><strong class="btn">E</strong><strong class="btn">R</strong><strong class="btn">T</strong><strong class="btn">S</strong> tools above the canvas to start drawing your level. <br><br>
    Each tool has its own hotkey, so you can switch between them without moving your cursor away from the canvas.<br><br>

    Add floors with the <strong class="btn">+</strong> button on the right side of the canvas, and switch between floors using the displayed buttons or your number keys: <strong>1–9</strong>.<br><br>

    The <strong class="red-btn">➤</strong> button launches an embedded Godot game, allowing you to playtest your level.
    When you're done testing, use the same button (now <strong class="red-btn">⏸︎</strong>) to return to the editor and continue iterating on your design.<br><br>

    Use the <strong class="btn">Export</strong> and <strong class="btn">Import</strong> buttons to save or load your designs as `.json` files.<br><br>

    To continue development in Godot, use the <strong class="btn">Export to Godot</strong> button to download a `.tscn` scene file that you can load in your own Godot game.<br><br>
  </p>
</Popup>

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

  .btn {
    background: var(--button-bg); 
    padding: 0.2rem 0.5rem; 
    border-radius: 4px;
  }

  .red-btn {
    background: var(--red-color); 
    margin: 0.2rem;
    padding: 0.2rem 0.5rem; 
    border-radius: 4px;
  }
  
  h3 {
    padding-bottom: 0.3em;
    border-bottom: 2px solid var(--divider-color);
  }
</style>