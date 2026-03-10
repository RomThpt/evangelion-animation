# Evangelion UI Component Library - Specification

## Overview

A shadcn-style React component library inspired by the UI/HUD designs from Neon Genesis Evangelion and the Rebuild films. Components are copied into your project (not installed as a dependency), fully customizable, and animated using a hybrid of Framer Motion and anime.js.

## Distribution Model

**shadcn-style**: Components are not published as an npm package. Instead:
- A CLI tool (`npx evangelion-ui add <component>`) copies component source into the consumer's project
- Components live in a configurable directory (default: `components/evangelion/`)
- Full source ownership - consumers can modify anything
- A registry JSON defines available components and their dependencies
- Peer dependencies: `react`, `framer-motion`, `animejs`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18+ (TypeScript) |
| Animation (lifecycle) | Framer Motion - mount/unmount, layout, gestures |
| Animation (timelines) | anime.js v4 - complex sequenced animations, looping effects |
| Styling | Tailwind CSS + CSS custom properties for theming |
| Demo / Docs | Storybook 8 |
| Build | Vite |
| Testing | Vitest + React Testing Library |

## Design System

### Color Palettes (Contextual)

```
NORMAL (Green/Cyan ops)
--eva-primary:     #00ff41   (terminal green)
--eva-secondary:   #00e5ff   (cyan accent)
--eva-bg:          #0a0a0a   (near-black)
--eva-surface:     #111111   (dark surface)
--eva-border:      #1a3a1a   (subtle green border)
--eva-text:        #00ff41
--eva-text-dim:    #007a20

CAUTION (Orange/Amber)
--eva-primary:     #ff9100   (amber)
--eva-secondary:   #ffab40   (light amber)
--eva-bg:          #0a0a0a
--eva-surface:     #1a1200
--eva-border:      #3a2a00
--eva-text:        #ff9100
--eva-text-dim:    #7a4500

EMERGENCY (Red)
--eva-primary:     #ff1744   (alert red)
--eva-secondary:   #ff5252   (light red)
--eva-bg:          #0a0000
--eva-surface:     #1a0000
--eva-border:      #3a0000
--eva-text:        #ff1744
--eva-text-dim:    #7a0b20

NERV (Purple branding)
--eva-nerv:        #7b1fa2   (NERV purple)
--eva-nerv-light:  #9c27b0
```

### Typography

- **Primary font**: `"Share Tech Mono"` (monospace, technical feel)
- **Fallback**: `"JetBrains Mono"`, `monospace`
- **Japanese text**: `"Noto Sans JP"` for katakana/kanji labels
- **Sizing**: Modular scale, small by default (data-dense displays)

### Visual Principles

1. **Scanline effect** - Subtle horizontal lines overlaid on surfaces
2. **Flicker** - Random opacity micro-animations on active elements
3. **Glow** - CSS `text-shadow` / `box-shadow` bloom on primary-color elements
4. **Geometric precision** - Hard angles, hexagonal motifs, no border-radius
5. **Data density** - Many small values visible at once
6. **Breathing** - Slow pulsing opacity on idle status elements

## Internationalization

All text labels support two modes via a `locale` prop on the `<EvaProvider>`:

- `"ja"` (default): Japanese primary text with smaller English subtitle
- `"en"`: English only

Example:
```
ja mode:  [同期率] SYNC RATE
en mode:  SYNC RATE
```

Labels are defined in a simple key-value map per component. Consumers can override any label via props.

## Audio Hooks

Components expose optional callback props for audio integration:

```tsx
<AlertOverlay
  onAlertTrigger={(level: "caution" | "emergency") => playKlaxon(level)}
  onDismiss={() => playBeep()}
/>

<SyncGauge
  onThresholdCross={(direction: "above" | "below") => playTone(direction)}
/>
```

No audio is bundled. Consumers bring their own audio implementation.

## Context Provider

```tsx
<EvaProvider
  palette="normal"        // "normal" | "caution" | "emergency" | auto
  locale="ja"             // "ja" | "en"
  scanlines={true}        // global scanline overlay
  flicker={true}          // global flicker effect
  animationSpeed={1}      // global animation speed multiplier
>
  {children}
</EvaProvider>
```

The provider manages:
- Current palette (can transition between states with animation)
- Locale
- Global visual effects toggle
- Animation speed (useful for reduced-motion preferences)

## Components (Full Suite)

### 1. StatusPanel
**Category**: NERV Command Center
**Description**: A bordered panel container with header label, status indicator, and optional scrolling data feed.
**Props**: `title`, `status` ("online" | "standby" | "offline" | "error"), `children`, `bordered`, `headerPosition`
**Animations**: Border draw-on animation on mount. Status indicator pulses. Header text types in character by character.
**Interactivity**: Clickable to expand/collapse. Hover reveals additional info slot.

### 2. SyncGauge
**Category**: NERV Command Center
**Description**: Circular or arc-shaped gauge showing synchronization rate (0-100%+). Inspired by the pilot sync rate displays.
**Props**: `value`, `maxValue`, `label`, `pilotName`, `thresholds` (warning/critical levels), `onThresholdCross`
**Animations**: Value animates smoothly on change. Arc fills with gradient. At thresholds, gauge flashes and palette shifts. Numbers roll like an odometer.
**Interactivity**: Hover shows detailed breakdown. Draggable in interactive mode to set value.

### 3. AlertOverlay
**Category**: Warning / Alert Systems
**Description**: Full-screen or contained overlay for emergency alerts. Red flashing borders, pulsing "WARNING" / "EMERGENCY" text, chevron patterns.
**Props**: `level` ("info" | "caution" | "emergency"), `message`, `code`, `dismissible`, `onAlertTrigger`, `onDismiss`
**Animations**: Cascading entry from screen edges. Text strobes. Chevron bars scroll horizontally. Background pulses between dark and alert color. Exit animation reverses entry.
**Interactivity**: Dismissible via click/key. Stacks multiple alerts.

### 4. HexGrid
**Category**: Data Visualization
**Description**: A grid of hexagonal cells that can display status, be individually colored, and animate in patterns. Used for area maps, system topology, or abstract data.
**Props**: `rows`, `cols`, `cells` (array of { id, status, value, color }), `onCellClick`, `highlightPattern`
**Animations**: Cells fade in with staggered delay (wave pattern). Active cells pulse. Selection ripple effect on click. Pattern highlighting animates across grid.
**Interactivity**: Clickable cells. Hover tooltip with cell data.

### 5. WaveformDisplay
**Category**: Data Visualization
**Description**: Animated waveform/oscilloscope display. Can show audio-like waves, heartbeat patterns, or signal noise.
**Props**: `data` (number[]), `type` ("sine" | "heartbeat" | "noise" | "flat" | "custom"), `color`, `speed`, `amplitude`, `label`
**Animations**: Continuous wave animation using Canvas 2D. Responds to data changes with smooth morphing. Flatline animation for disconnect state.
**Interactivity**: Hover freezes waveform and shows crosshair with value.

### 6. TargetReticle
**Category**: HUD / Targeting
**Description**: Crosshair/targeting overlay with rotating elements, distance readout, and lock-on animation.
**Props**: `locked`, `targetName`, `distance`, `angle`, `position` ({ x, y }), `size`
**Animations**: Outer ring rotates continuously. Lock-on triggers concentric rings contracting to center. Distance numbers count up/down. Corner brackets snap to different sizes.
**Interactivity**: Can be dragged to reposition. Click to toggle lock-on.

### 7. DataReadout
**Category**: NERV Command Center
**Description**: A compact numeric/text readout with label, value, and unit. Shows rapidly updating numbers in the Evangelion style.
**Props**: `label`, `value`, `unit`, `precision`, `trend` ("up" | "down" | "stable"), `flashOnChange`
**Animations**: Value changes animate with a rapid number-roll effect. Flash highlight on change. Trend arrow animates direction.
**Interactivity**: Click to cycle through display formats (absolute, percentage, delta).

### 8. ProgressBar
**Category**: NERV Command Center
**Description**: Segmented progress bar with percentage readout. Used for loading sequences, power levels, contamination levels.
**Props**: `value`, `maxValue`, `segments`, `label`, `showPercentage`, `variant` ("fill" | "segments" | "blocks")
**Animations**: Segments fill sequentially with stagger. At 100%, a completion flash plays. Segments can individually pulse. Number rolls as value changes.
**Interactivity**: Hover shows exact value. Optional click-to-set.

### 9. ATFieldDiagram
**Category**: Data Visualization
**Description**: Octagonal/geometric diagram showing AT Field strength and integrity. Concentric geometric shapes with sector breakdowns.
**Props**: `sectors` (array of { label, strength, integrity }), `overallStrength`, `breached`, `onSectorClick`
**Animations**: Concentric shapes rotate slowly in opposite directions. Breach triggers crack/shatter animation on affected sector. Strength changes animate ring thickness. Pulsing glow on active field.
**Interactivity**: Click sectors for detail view. Hover highlights individual sector.

### 10. PilotStatus
**Category**: NERV Command Center
**Description**: Pilot status card showing name, sync rate, vitals (heart rate, neural connection), plug depth, and contamination level. Composite component using SyncGauge, ProgressBar, WaveformDisplay.
**Props**: `pilot` ({ name, designation, syncRate, heartRate, neuralLink, plugDepth, contamination, status }), `compact`
**Animations**: Each sub-element animates independently. Status changes trigger palette shift on the entire card. Disconnect plays a sequence of elements going dark one by one.
**Interactivity**: Expandable between compact (sync rate only) and full view.

### 11. CountdownTimer
**Category**: Warning / Alert Systems
**Description**: Large countdown display with colon-separated segments. Used for operation timers, self-destruct sequences, battery remaining.
**Props**: `targetTime`, `format` ("HH:MM:SS" | "MM:SS" | "SS.ms"), `label`, `warningThreshold`, `criticalThreshold`, `onComplete`, `paused`
**Animations**: Digits flip/roll on each tick. At warning threshold, text shifts to orange. At critical, shifts to red with flash. Final 10 seconds get individual digit pulse. Completion triggers a flash-out.
**Interactivity**: Click to pause/resume (if allowed). Hover shows elapsed/remaining toggle.

### 12. SystemLog
**Category**: NERV Command Center
**Description**: Scrolling terminal-style log feed with timestamped entries, color-coded by severity.
**Props**: `entries` (array of { timestamp, message, level, source }), `maxVisible`, `autoScroll`, `filter`
**Animations**: New entries slide in from bottom with typewriter effect. Entries fade slightly as they age. Error entries flash on arrival. Scroll indicator pulses when new entries are below viewport.
**Interactivity**: Scrollable. Clickable entries expand detail. Filter by level/source.

### 13. MapOverlay
**Category**: HUD / Targeting
**Description**: Top-down tactical map with grid lines, position markers, range circles, and threat indicators.
**Props**: `center`, `zoom`, `markers` (array of { position, type, label, status }), `rangeCircles`, `gridDensity`
**Animations**: Grid lines draw on mount. Markers blink based on type. Range circles pulse outward. Threat markers have expanding ping animation. Pan/zoom transitions are smooth.
**Interactivity**: Pan and zoom. Click markers for info. Drag to measure distance.

### 14. EntryPlugHUD
**Category**: HUD / Targeting
**Description**: Composite full-screen HUD overlay simulating the view from inside an Eva entry plug. Combines TargetReticle, DataReadout, WaveformDisplay, and edge UI elements.
**Props**: `targets`, `syncRate`, `commsActive`, `lclLevel`, `hudElements` (toggle individual elements)
**Animations**: Boot sequence on mount (elements appear in choreographed order). Comm activation flickers. LCL level rises with fluid animation. All sub-elements animate per their own specs.
**Interactivity**: Targets are clickable. HUD elements can be toggled.

### 15. PatternAlert
**Category**: Warning / Alert Systems
**Description**: Pattern detection notification (Blue Pattern = Angel, Orange = unknown). Animated classification display with confidence meter.
**Props**: `pattern` ("blue" | "orange" | "none"), `classification`, `confidence`, `designation`, `onConfirm`
**Animations**: Detection triggers expanding concentric rings. Pattern type text types in with typewriter effect. Confidence bar fills rapidly. Classification text blinks while unconfirmed. Confirmation locks display with a stamp animation.
**Interactivity**: Confirm/dismiss buttons. Click for detailed analysis view.

## Component File Structure

```
components/evangelion/
  provider/
    eva-provider.tsx
    eva-context.ts
    themes.ts
    types.ts
  primitives/
    scanlines.tsx         # Scanline overlay effect
    flicker.tsx           # Flicker animation wrapper
    glow-text.tsx         # Text with glow effect
    type-writer.tsx       # Typewriter text animation
    number-roll.tsx       # Odometer-style number animation
  components/
    status-panel.tsx
    sync-gauge.tsx
    alert-overlay.tsx
    hex-grid.tsx
    waveform-display.tsx
    target-reticle.tsx
    data-readout.tsx
    progress-bar.tsx
    at-field-diagram.tsx
    pilot-status.tsx
    countdown-timer.tsx
    system-log.tsx
    map-overlay.tsx
    entry-plug-hud.tsx
    pattern-alert.tsx
  hooks/
    use-eva-animation.ts  # Shared anime.js timeline helpers
    use-palette.ts        # Palette access/transition hook
    use-flicker.ts        # Random flicker timing
    use-number-roll.ts    # Number rolling animation
  utils/
    animation-presets.ts  # Common anime.js animation configs
    colors.ts             # Color manipulation utilities
    i18n.ts               # Label maps and locale helpers
  index.ts                # Barrel exports
```

## Storybook Structure

```
stories/
  Introduction.mdx            # Overview, installation, usage
  Provider.stories.tsx         # EvaProvider palette/locale demos
  Primitives/
    Scanlines.stories.tsx
    Flicker.stories.tsx
    GlowText.stories.tsx
    TypeWriter.stories.tsx
    NumberRoll.stories.tsx
  Components/
    StatusPanel.stories.tsx
    SyncGauge.stories.tsx
    AlertOverlay.stories.tsx
    HexGrid.stories.tsx
    WaveformDisplay.stories.tsx
    TargetReticle.stories.tsx
    DataReadout.stories.tsx
    ProgressBar.stories.tsx
    ATFieldDiagram.stories.tsx
    PilotStatus.stories.tsx
    CountdownTimer.stories.tsx
    SystemLog.stories.tsx
    MapOverlay.stories.tsx
    EntryPlugHUD.stories.tsx
    PatternAlert.stories.tsx
  Compositions/
    NervCommandCenter.stories.tsx  # Full command center layout
    EntryPlugView.stories.tsx      # Full HUD composition
    EmergencySequence.stories.tsx  # Alert cascade demo
```

## Animation Guidelines

### Timing
- **Boot/mount sequences**: 800-1200ms total, staggered 50-100ms per element
- **Value changes**: 300-500ms easing
- **Alert flashes**: 200ms on/off cycle
- **Idle pulses**: 2000-4000ms sine wave
- **Typewriter**: 30-50ms per character
- **Number roll**: 150-300ms per digit

### Easing
- **Data changes**: `easeOutExpo` (fast start, smooth settle)
- **Structural animations**: `easeInOutQuart` (smooth both ways)
- **Alert/emergency**: `linear` or `steps` (mechanical, urgent)
- **Idle/ambient**: `easeInOutSine` (breathing feel)

### Reduced Motion
All animations respect `prefers-reduced-motion`:
- Fade replaces slide/scale
- No flicker or strobe effects
- Instant value changes instead of rolls
- Static instead of pulsing

## Implementation Phases

### Phase 1: Foundation
- Project setup (Vite + React + TypeScript + Tailwind)
- EvaProvider, themes, CSS custom properties
- Primitive components (scanlines, flicker, glow-text, typewriter, number-roll)
- Storybook setup

### Phase 2: Core Components
- StatusPanel
- SyncGauge
- AlertOverlay
- DataReadout
- ProgressBar
- WaveformDisplay

### Phase 3: Advanced Components
- HexGrid
- TargetReticle
- ATFieldDiagram
- CountdownTimer
- SystemLog
- PatternAlert

### Phase 4: Composite Components
- PilotStatus
- MapOverlay
- EntryPlugHUD

### Phase 5: Polish & Distribution
- Storybook stories for all components
- Composition stories (full layouts)
- CLI tool for shadcn-style installation
- Documentation
- Accessibility audit
- Performance optimization
