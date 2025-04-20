<header>
    <div class="logo">🧱 LevelForge</div>
    <nav>
      <button class="nav-button">File</button>
      <button class="nav-button">Help</button>
    </nav>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    background-color: #1a1a1a;
    margin-bottom: 4rem;
  }

  header nav {
    margin-left: 2rem;
    display: flex;
  }

  .logo {
    margin-left: 1rem;
  }

  .nav-button {
    border-radius: 0px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
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
    background-color: #646cff;
    cursor: pointer;
    transition: background-color 0.25s;
  }
</style>