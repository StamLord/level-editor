export const toolInfo = {
    0: {
        name: "Select",
        tips: [ {button: "lmb", text: "Select"}, 
                {button: "rmb", text: "Drag"}, 
                {button: "rmb", text: "Cancel"},
                {button: "ctrl+c", text: "Copy"},
                {button: "ctrl+v", text: "Paste"},
                {button: "del", text: "Delete"}]
    }, 
    1: {
        name: "Wall",
        settings: [{
            type: "slider",
            label: "Thickness",
            variable: "wallThickness",
            min: 0.0,
            max: 1.0,
            step: 0.05,
            value: 0.25
        }],
        tips: [ {button: "lmb", text: "Draw"},
                {button: "rmb", text: "Delete"}]
    },
    2: {
        name: "Platform",
        tips: [ {button: "lmb", text: "Draw"},
                {button: "rmb", text: "Delete"}]
    },
    3: {
        name: "Ramp",
        tips: [ {button: "lmb", text: "Draw"},
                {button: "lmb", text: "Rotate"},
                {button: "rmb", text: "Delete"}]
    },
    4: {
        name: "Fence",
        settings: [{
            type: "slider",
            label: "Thickness",
            variable: "fenceThickness",
            min: 0.0,
            max: 1.0,
            step: 0.05,
            value: 0.25
        }],
        tips: [ {button: "lmb", text: "Draw"},
                {button: "rmb", text: "Delete"}]
    },
    5: {
        name: "Stairs",
        tips: [ {button: "lmb", text: "Draw"},
                {button: "lmb", text: "Rotate"},
                {button: "rmb", text: "Delete"}]
    },
}

// Unique tools
export const Tool = {
    SELECT: 0,
    WALL: 1,
    PLATFORM: 2,
    RAMP: 3,
    FENCE: 4,
    STAIRS: 5,
}

// ToolType groups multiple Tools together
export const ToolType = {
    SELECT: {
    tools: [Tool.SELECT],
    active: 0
    },
    WALL: {
    tools: [Tool.WALL],
    active: 0
    },
    PLATFORM: {
    tools: [Tool.PLATFORM],
    active: 0
    },
    RAMP: {
    tools: [Tool.RAMP],
    active: 0
    },
    FENCE: {
    tools: [Tool.FENCE],
    active: 0
    },
    STAIRS: {
    tools: [Tool.STAIRS],
    active: 0
    },
}