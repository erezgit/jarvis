# Jarvis Image Generation Guide

This guide provides specific instructions for creating AI-generated images that align with Jarvis design standards. Use these prompts and guidelines when generating images to maintain visual consistency across the project.

## Image Style Reference

All Jarvis concept images should follow these style guidelines:

- **Aesthetic**: Modern tech magazine style - clean, sophisticated yet approachable
- **Color Scheme**: Predominantly cool blues and teals with strategic accent colors
- **Composition**: Balanced asymmetry with clear focal points
- **Lighting**: Soft ambient lighting with subtle highlights
- **Texture**: Minimal, with smooth surfaces and occasional glass/translucent elements

## Prompt Engineering Guidelines

When constructing prompts for AI image generation:

1. **Start with a clear subject** (e.g., "A futuristic AI command center")
2. **Add visual style indicators** (e.g., "clean, minimal design")
3. **Specify color palette** (e.g., "blue and teal color scheme")
4. **Include lighting details** (e.g., "soft ambient lighting")
5. **Reference professional context** (e.g., "high-end tech magazine aesthetic")

## Sample Prompts

### Jarvis Command Center
```
A sleek, modern AI command center with holographic blue displays, minimal design aesthetic, cool blue and teal color palette, soft ambient lighting, high-end tech magazine style, digital assistant concept with clean lines and subtle glass elements
```

### Data Visualization
```
Elegant data visualization interface with 3D holographic elements, minimal design, blue and teal color scheme, contemporary tech aesthetic similar to MIT Technology Review, clean lines, professional look with subtle depth
```

### AI Interaction
```
Human interacting with an AI assistant interface, modern minimal design, blue accent lighting, clean lines, magazine editorial style composition, soft ambient glow, professional tech aesthetic with approachable elements
```

## Prompt Modifiers

Add these terms to refine the style:

- **Editorial Quality**: "magazine quality", "editorial style", "professional publication aesthetic"
- **Technical Sophistication**: "precision engineering", "technical blueprint elements", "advanced technology"
- **Accessibility**: "approachable design", "human-centered interface", "intuitive controls"
- **Material Palette**: "subtle glass surfaces", "brushed metal accents", "minimalist materials"

## What to Avoid

- Overly busy or cluttered compositions
- Excessive decoration or ornamental elements
- Dystopian or threatening tech aesthetics
- Cartoonish or unrealistic human figures
- Conflicting or chaotic color schemes
- Low-resolution or pixelated elements

## Post-Generation Evaluation

After generating an image, check that it:

1. Clearly communicates the intended concept
2. Follows the established color palette
3. Has a clear focal point and visual hierarchy
4. Balances technical sophistication with approachability
5. Would feel at home in a modern technology publication

## Practical Application

When using the image generation service:

```bash
python engine/src/services/image/generate_image.py "[PROMPT]" --size 1024x1024 --quality hd --style vivid --output workspace/generated_images
```

Replace `[PROMPT]` with your constructed prompt following the guidelines above. 