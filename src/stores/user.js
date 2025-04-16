import { writable } from 'svelte/store';

export let playerHeight = writable(2);
export let playerRadius = writable(0.3);
export let playerSpeed = writable(5);
export let playerSprintSpeed = writable(8);
export let playerJumpVelocity = writable(4.5);

export let exportUnit = writable(1); // Will convert grid unit (25px) into 1 meter in Godot
export let floorHeight = writable(4); // Default height for each floor - Affects wall, ramps & stairs height