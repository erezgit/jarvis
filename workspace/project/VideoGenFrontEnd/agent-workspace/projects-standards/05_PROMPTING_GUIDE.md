# Gen-3 Alpha and Turbo Prompting Guide

## Model Overview

### Gen-3 Alpha
- Available to Standard plan users and higher
- Text-only prompting supported
- Higher fidelity, consistency, and motion quality
- Cost: 10 credits per second

### Gen-3 Alpha Turbo
- Available on all plan levels
- Requires input image
- Faster generation at lower cost
- Cost: 5 credits per second

## Technical Specifications

| Feature | Gen-3 Alpha | Gen-3 Alpha Turbo |
|---------|-------------|-------------------|
| Duration | 5 or 10 seconds | 5 or 10 seconds |
| Resolution | 1280x768 | 1280x768 or 768x1280 |
| Frame Rate | 24 FPS | 24 FPS |
| Max Extension | 40 seconds | 34 seconds |
| Keyframe Support | First/Last frame | First/Middle/Last frame |
| Character Limit | 1000 characters | 1000 characters |

## Effective Prompting Strategies

### Text-Only Prompts (Gen-3 Alpha)
For best results, include these elements in your prompts:
1. Camera angles and movement
2. Subject description
3. Scene details
4. Style preferences
5. Movement directions

#### Example Prompts:
```
"A dramatic zoom in on the face of movie villain as he raises an eye brow and the lights shift, casting an eerie red glow across him. Evil villain lair, 1980s spy movie, cinematic, 35mm film, dynamic movement."
```

```
"A sci-fi-like action chase scene, FPV hyper-speed fly through multiple locations. Racing through asteroid fields, through dense clouds, through a complex system of desolate landscapes. Dynamic motion, dynamic blur, timelapse, 30x speed, cinematic, muted color palette."
```

### Image + Text Prompts (Both Models)
When using an input image:
1. Keep text prompts simple and focused on motion
2. Avoid re-describing the image content
3. Focus on describing desired movement and camera behavior
4. Use the image as a starting point for the animation

#### Example Prompt Structure:
```
[Input Image] + "the subject smoothly moves forward, camera slowly tracks backward maintaining framing, subtle environmental movement"
```

## Best Practices

### DO:
- Use highly descriptive language for text-only prompts
- Focus on motion and camera movement
- Specify artistic style and cinematography preferences
- Keep image prompts motion-focused
- Use technical terms like "dynamic motion," "tracking shot," "zoom"

### DON'T:
- Overload prompts with conflicting instructions
- Repeat image content in prompts when using image input
- Exceed the 1000 character limit
- Mix too many different styles or movements

## Advanced Features

### Camera Control
- Customize direction and intensity of camera movement
- Available in both models
- Helps create more intentional shots

### Fixed Seed
- Enable for consistent style across generations
- Useful for creating variations of the same concept
- Can be copied from successful generations

### Keyframes
- Gen-3 Alpha: Control first or last frame
- Gen-3 Alpha Turbo: Control first, middle, and last frames
- Use for more precise motion control

## Tips for Specific Use Cases

### Character Animation:
```
"[character description] performs [specific action], [camera movement], [style], [lighting], [atmosphere]"
```

### Scene Transitions:
```
"Camera smoothly moves from [scene A] to [scene B], transitioning through [transition effect], [mood], [speed]"
```

### Abstract Animations:
```
"[shape/pattern] morphs and flows with [movement type], [color scheme], [texture], [timing]"
```

## Troubleshooting

If your results aren't as expected:
1. Simplify complex prompts
2. Focus on one primary motion or action
3. Be more specific about camera movement
4. Use technical terms for precise control
5. Experiment with different keyframe configurations 