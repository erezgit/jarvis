# 🎬 RunwayML Gen-3 Alpha Prompting Guide

## 📋 Table of Contents
1. [Model Overview](#model-overview)
2. [Model Specifications](#model-specifications)
3. [Prompting Best Practices](#prompting-best-practices)
4. [Example Prompts](#example-prompts)
5. [Advanced Settings](#advanced-settings)
6. [Technical Considerations](#technical-considerations)

## 🚀 Model Overview

Gen-3 Alpha represents RunwayML's latest advancement in video generation, offering:
- Enhanced fidelity and consistency
- Improved motion quality
- Faster generation speeds
- Support for both text-to-video and image-to-video

Two variants are available:
- **Gen-3 Alpha**: Full model with text-only capability (Standard plan and higher)
- **Gen-3 Alpha Turbo**: Faster, cost-effective variant requiring input images (All plan levels)

## 📊 Model Specifications

### Gen-3 Alpha
- **Cost**: 10 credits/second
- **Duration**: 5 or 10 seconds (extendable)
- **Resolution**: 1280x768
- **Frame Rate**: 24fps
- **Input Types**: Text or Image (optional)
- **Text Limit**: 1000 characters
- **Max Extended Length**: 40 seconds
- **Keyframes**: First or last frame

### Gen-3 Alpha Turbo
- **Cost**: 5 credits/second
- **Resolution**: 1280x768 or 768x1280
- **Input Types**: Text + Image (required)
- **Max Extended Length**: 34 seconds
- **Keyframes**: First, middle, and last frame

## 💡 Prompting Best Practices

### Text-Only Prompts (Gen-3 Alpha)
1. **Be Descriptive Yet Clear**
   - Include camera angles
   - Specify subject details
   - Describe scene elements
   - Define artistic style
   - Detail movement patterns

2. **Key Elements to Include**
   - Camera movement
   - Lighting conditions
   - Scene atmosphere
   - Cinematic qualities
   - Motion dynamics

### Image + Text Prompts (Both Models)
1. **Focus on Motion**
   - Describe desired movement
   - Specify camera behavior
   - Avoid re-describing image content
   - Keep prompts motion-focused

2. **Image Guidelines**
   - Use supported resolutions
   - Ensure clear subject matter
   - Consider composition
   - Prepare for cropping if needed

## 📝 Example Prompts

### Text-Only Examples
1. **Dramatic Character Shot**
```
A dramatic zoom in on the face of movie villain as he raises an eye brow and the lights 
shift, casting an eerie red glow across him. Evil villain lair, 1980s spy movie, 
cinematic, 35mm film, dynamic movement.
```

2. **Dynamic Action Scene**
```
A sci-fi-like action chase scene, FPV hyper-speed fly through multiple locations. 
Racing through asteroid fields, through dense clouds, through complex system of 
desolate landscapes. Dynamic motion, dynamic blur, timelapse, 30x speed, cinematic, 
muted color palette.
```

### Image + Text Examples
1. **Object Animation**
```
[Input: Elastic material image]
The gloved hands pull to stretch the face made of a bubblegum material
```

2. **Natural Movement**
```
[Input: Sea life image]
The sea anemones sway and flow naturally in the water. The camera remains still.
```

## ⚙️ Advanced Settings

### Camera Control
- Configurable direction
- Adjustable intensity
- Scene movement control

### Generation Settings
1. **Fixed Seed**
   - Enable for consistent results
   - Copy/paste previous seeds
   - Useful for style matching

2. **Aspect Ratio** (Turbo only)
   - 1280x768 (landscape)
   - 768x1280 (portrait)

3. **Duration Options**
   - 5 seconds
   - 10 seconds
   - Extendable in increments

## 🔧 Technical Considerations

### Video Processing
1. **Post-Generation Options**
   - Video extension
   - Lip sync integration
   - Video-to-video processing
   - 4K upscaling

2. **Edit Capabilities**
   - Duration adjustment
   - Speed modification
   - Camera shake effects
   - Video reversal
   - Aspect ratio expansion

### Output Formats
- MP4 video
- GIF animation
- Multiple resolution options

## 🎯 Best Practices Summary
1. Use highly descriptive prompts for text-only generation
2. Focus on motion description with image inputs
3. Leverage camera control for intentional movement
4. Consider using fixed seeds for consistent results
5. Plan for potential video extensions
6. Optimize input images for supported resolutions 