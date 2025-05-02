<script>
	import { onMount, onDestroy } from 'svelte';
    import { messages } from '../data/loadingMessages';

	let progress = 25;
	let interval;

	onMount(() => {
		interval = setInterval(() => {
			if (progress < 100) {
				progress += Math.random() * 50; // simulate varying speed
				progress = Math.min(progress, 100);
			}
		}, 200);
	});

	onDestroy(() => {
		clearInterval(interval);
	});

    function getRandomMessage() {
        return messages[Math.floor(Math.random() * messages.length)];
    }

</script>

{#if progress < 100}
    <div class="fullscreen">
        <p>{getRandomMessage()}</p>
        <div class="loading-container">
            <div class="loading-bar" style="width: {progress}%"></div>
        </div>
    </div>
{/if}

<style>
    .fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
		z-index: 1000;
    }

	.loading-container {
		width: 50%;
		border-radius: 8px;
		overflow: hidden;
        background: var(--button-bg);
		height: 20px;
		box-shadow: 0 0 4px rgba(0,0,0,0.4);
	}

	.loading-bar {
		height: 100%;
		background: linear-gradient(
            90deg,
            #646cff,
            #fa7900,
            #646cff
            ) left/200% 100%;
        background-repeat: repeat;
        animation: scroll-gradient 3s linear infinite;
		width: 0%;
		transition: width 0.2s ease;
	}

    @keyframes scroll-gradient {
        to {
        background-position: 200% 0;
        }
    }
</style>
