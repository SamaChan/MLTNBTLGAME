# Letter Ban Activation Animation - Component Spec

## Overview
When a player activates the Letter Ban power-up, a dramatic, attention-grabbing animation sequence plays to inform both the caster and target.

## Visual Design

### Color Palette
- **Primary**: `#FF0044` (Neon Red)
- **Secondary**: `#FF00FF` (Neon Pink)
- **Background**: `#0A0A0F` (Cyber Dark)
- **Text**: `#FFFFFF` (White)
- **Glow**: `rgba(255, 0, 68, 0.8)`

### Typography
- **Title**: "Orbitron" or "Rajdhani" (Google Fonts), Bold, 24px
- **Body**: "Inter", Regular, 14px
- **Banned Letter**: "Orbitron", Bold, 48px

## Animation Sequence

### Phase 1: Trigger (0-200ms)
- Screen flash: Red overlay at 30% opacity
- Sound effect: Electric zap/snap (if enabled)
- Button pulses with red glow

### Phase 2: Targeting (200-500ms)
- Letter selection keyboard slides up from bottom
- Animation: `slide-up` with spring physics
- Background dims to 70% opacity
- Red particle burst around selected opponent

### Phase 3: Selection (500-1000ms)
- Selected letter in keyboard scales up 1.2x on hover
- Banned letter icon appears with `pop` animation
- Preview shows letter being "locked" with chain effect

### Phase 4: Activation (1000-1500ms)
- Selected letter transforms to:
  - Turn black with red border
  - "🚫" icon overlay
  - Pulsing red glow
  - "BANNED!" text flashes above
- Animation: `banned-flash` (pulsing opacity)
- Screen shake: 5px horizontal, 100ms

### Phase 5: Target Feedback (1500-2000ms)
- On target player's screen:
  - Large "🚫 LETTER BANNED!" banner slides from top
  - Banned letter on their keyboard turns black
  - Red "X" crosses appear over the letter
  - "BANNED!" flash animation repeats 3 times
  - Sound: Warning klaxon (if enabled)

### Phase 6: Timer Display (2000ms+)
- Timer badge appears below banned letter
- Countdown: 25 seconds with pulsing effect
- Progress bar shows remaining time
- At 5 seconds: Timer turns urgent red

## Component States

### Keyboard Key States
1. **Default**: Dark gray background, white text
2. **Hover**: Red background (#FF0044/20), red border
3. **Selected**: Red background, scale 1.2, glow effect
4. **Banned**: Black background, red border, "🚫" overlay, locked icon
5. **Locked**: No hover effects, cursor: not-allowed

### Target Player Indicator
1. **Normal**: Gray border
2. **Selected**: Red border, pulsing glow
3. **Banned**: Red overlay, "🚫" badge

## Sound Effects (Optional)
- **Activation**: Electric zap/snap
- **Selection**: Click sound
- **Confirmation**: Heavy door slam
- **Warning (target)**: Klaxon/alert sound

## Accessibility
- ARIA live region announces: "Letter [X] has been banned for 25 seconds"
- High contrast mode: Red becomes white with red border
- Reduced motion: Static display with timer only

## CSS Classes (Tailwind)

```css
/* Banned key styling */
.banned-key {
  @apply bg-black border-red-600 text-gray-500 cursor-not-allowed;
}

.banned-key::after {
  content: '🚫';
  @apply absolute text-[8px] top-1 right-1;
}

/* Banned flash animation */
@keyframes banned-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.animate-banned-flash {
  animation: banned-flash 0.5s ease-in-out 3;
}

/* Glow effects */
.banned-glow {
  box-shadow: 0 0 20px rgba(255, 0, 68, 0.8),
              0 0 40px rgba(255, 0, 68, 0.4);
}
```

## Responsive Considerations
- **Mobile**: Full-screen overlay, larger touch targets (48px minimum)
- **Tablet**: Floating panel, 44px keys
- **Desktop**: Centered modal, 40px keys

## Interaction Flow

```
Player clicks Letter Ban
    ↓
Select target opponent
    ↓
Select letter to ban
    ↓
Confirmation animation
    ↓
Target player notified
    ↓
Timer starts (25s)
    ↓
Ban expires
```

## Implementation Priority
1. **Critical**: Visual feedback on both players' screens
2. **High**: Keyboard key disable functionality
3. **Medium**: Timer display and countdown
4. **Low**: Sound effects and particles
