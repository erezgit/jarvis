# Jarvis Documentation Standards

## Overview
This document outlines the design and content standards for Jarvis documentation pages, based on the Evolution Roadmap page as our exemplar template.

## Design Principles

1. **Clean, Modern Aesthetic**
   - Dark theme with careful use of color accents
   - Ample whitespace for readability
   - Consistent typography hierarchy

2. **Visual Engagement**
   - Gradient backgrounds for key sections
   - Card-based components for distinct information blocks
   - Strategic use of color to indicate categories or phases

3. **Content Organization**
   - Clear section headers
   - Progressive disclosure of information
   - Visually distinct components for different content types

## Visual Elements Reference

### Page Structure
```jsx
<div className="px-6 sm:px-8 bg-[#141414] text-white">
  {/* Header Section */}
  <div className="mb-8">
    <h1 className="text-2xl font-bold">Section Title</h1>
    <p className="mt-3 text-gray-400">Brief description (1-2 sentences)</p>
  </div>
  
  {/* Main Content Container */}
  <div className="space-y-8">
    {/* Content Sections */}
  </div>
</div>
```

### Feature Section Template
```jsx
<section className="relative overflow-hidden bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#242424] p-8 rounded-lg shadow-md">
  <div className="relative z-10">
    <h2 className="text-xl font-semibold mb-6">Section Title</h2>
    <p className="text-gray-300 leading-relaxed mb-8">
      Brief explanatory text (2-3 sentences maximum)
    </p>
    
    {/* Content Components */}
  </div>
  
  {/* Background Decorations */}
  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full -mt-20 -mr-20 blur-3xl"></div>
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full -mb-40 -ml-40 blur-3xl"></div>
</section>
```

### Card Component
```jsx
<div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#242424]/30 mb-8">
  <h3 className="text-lg font-medium text-blue-300 mb-4">Card Title</h3>
  <ul className="space-y-3 text-gray-300">
    {/* List items */}
  </ul>
</div>
```

### Color-Coded Item List
```jsx
<ul className="space-y-3 text-gray-300">
  <li className="flex items-start">
    <div className="bg-blue-900/20 p-1 rounded-md mr-3 mt-1">
      <div className="w-3 h-3 bg-blue-600/70 rounded-sm"></div>
    </div>
    <span>List item text here</span>
  </li>
  {/* Additional list items */}
</ul>
```

### Phase Cards Template
```jsx
<div className="grid grid-cols-3 gap-8">
  {/* Phase Card */}
  <div className="border border-purple-800/20 bg-purple-900/10 p-5 rounded-lg shadow-md shadow-purple-900/5 relative">
    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-600/5 rounded-full -mt-3 -mr-3 blur-xl"></div>
    <div className="mb-3 flex items-center">
      <div className="w-8 h-8 rounded-full bg-purple-900/40 flex items-center justify-center mr-3">
        <span className="font-bold text-purple-200">1</span>
      </div>
      <h3 className="text-purple-300 font-semibold">Phase Title</h3>
    </div>
    <div className="space-y-3 pl-11">
      {/* Phase items */}
      <div className="flex items-start">
        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 mt-1.5"></div>
        <span className="text-sm text-gray-300">Item text</span>
      </div>
      {/* Additional items */}
    </div>
  </div>
  {/* Additional phase cards */}
</div>
```

## Content Guidelines

### Page Length
- Pages should be concise and focused (similar to the Evolution Roadmap length)
- Aim for 2-4 main sections per page
- Content should be viewable without excessive scrolling

### Content Structure
1. **Header**: Page title and 1-2 sentence description
2. **Overview**: Brief introduction to the topic (3-5 sentences)
3. **Main Sections**: 2-4 distinct content areas
4. **Navigation**: Links to related pages

### Text Guidelines
- **Headers**: Clear, descriptive, 2-5 words
- **Paragraphs**: 2-4 sentences, focused on one idea
- **Lists**: 3-7 items, with parallel structure
- **Descriptions**: Concise, avoiding technical jargon where possible

### Visuals
- Use visual elements to enhance understanding, not as decoration
- Create clear visual hierarchy with size, color, and position
- Maintain consistent visual language across all documentation

## Color System

### Base Colors
- Background: `#141414` (page background)
- Secondary Background: `#1B1B1B` (card background)
- Borders: `#242424` (with varying opacity)
- Text: White and gray variations

### Accent Colors
- Purple: Phase 1 elements (`border-purple-800/20`, `bg-purple-900/10`, etc.)
- Blue: Phase 2 elements (`border-blue-800/20`, `bg-blue-900/10`, etc.)
- Green: Phase 3 elements (`border-emerald-800/20`, `bg-emerald-900/10`, etc.)

## Page Templates

### Documentation Home
- Brief overview of documentation structure
- Card-based navigation to main sections
- Visual indicators of documentation hierarchy

### Concept Pages
- Clear definition at the top
- Visual representation of the concept
- Examples and applications
- Related concepts

### Guide Pages
- Step-by-step instructions
- Visual examples of each step
- Common issues and solutions
- Expected outcomes

## Implementation Notes

1. When creating new documentation:
   - Start with the appropriate template
   - Maintain consistent visual style
   - Follow content length guidelines
   - Include navigation to related pages

2. Review all documentation for:
   - Visual consistency
   - Content clarity and conciseness
   - Technical accuracy
   - Proper navigation

This standard uses the Evolution Roadmap page as our gold standard for documentation design and content structure. 