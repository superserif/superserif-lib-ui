document.addEventListener('DOMContentLoaded', () => {
  // --- Filter Resize Functionality ---
  const filterPanel = document.getElementById('filterPanel');
  const resizeHandle = document.getElementById('resizeHandle');

  if (filterPanel && resizeHandle) {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = filterPanel.offsetWidth;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isResizing) return;

      const delta = e.clientX - startX;
      let newWidth = startWidth + delta;

      // Apply min/max constraints
      const minWidth = 350;
      const maxWidth = 600;
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

      filterPanel.style.width = `${newWidth}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }

  // --- 2D Control Pad Interaction ---
  const pad2d = document.getElementById('pad2d');
  const padSlider = document.getElementById('padSlider');
  const padValueX = document.getElementById('padValueX');
  const padValueY = document.getElementById('padValueY');

  // Exposed variables for X and Y axes
  let varX = 0; // -50 to +50 (center is 0)
  let varY = 0; // -50 to +50 (center is 0)

  const padGrid = document.querySelector('.pad-grid');
  const dots = [];

  // Generate Grid Dots
  if (padGrid) {
    // Clear existing content if any (though usually empty)
    padGrid.innerHTML = '';

    const spacing = 13.5;
    const cols = 8;
    const rows = 8;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const dot = document.createElement('div');
        dot.classList.add('pad-dot');
        // Position dots based on the previous background-position 0 0
        // The grid container has insets, so we position relative to that
        const x = i * spacing + (spacing / 2); // Offset to center in cell like background
        const y = j * spacing + (spacing / 2);

        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;

        // Store coordinates for distance calculation
        // We need to map these to the pad2d coordinate space
        // padGrid has inset: 8.9px 9.3px 8.6px 9.8px;
        // So dot X in pad2d = 9.8 + x
        // Dot Y in pad2d = 8.9 + y
        dot.dataset.gx = 9.8 + x;
        dot.dataset.gy = 8.9 + y;

        padGrid.appendChild(dot);
        dots.push(dot);
      }
    }
  }

  if (pad2d && padSlider) {
    let isDragging = false;

    function updateDots(sliderX, sliderY) {
      // sliderX/Y are relative to pad2d
      const maxDist = 60; // Radius of influence

      dots.forEach(dot => {
        const dx = parseFloat(dot.dataset.gx) - sliderX;
        const dy = parseFloat(dot.dataset.gy) - sliderY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          // Calculate influence (0 to 1)
          const influence = 1 - (dist / maxDist);
          // Scale: 1 to 2.5
          const scale = 1 + (influence * 1.5);
          // Opacity: 0.2 to 1
          const opacity = 0.2 + (influence * 0.8);

          dot.style.transform = `translate(-50%, -50%) scale(${scale})`;
          dot.style.opacity = opacity;
        } else {
          // Reset to default
          dot.style.transform = `translate(-50%, -50%) scale(1)`;
          dot.style.opacity = 0.2;
        }
      });
    }

    function updatePadPosition(clientX, clientY) {
      const rect = pad2d.getBoundingClientRect();
      const sliderRadius = 27 / 2;

      // Calculate position relative to pad
      let x = clientX - rect.left;
      let y = clientY - rect.top;

      // Clamp to pad boundaries (accounting for slider size)
      x = Math.max(sliderRadius, Math.min(rect.width - sliderRadius, x));
      y = Math.max(sliderRadius, Math.min(rect.height - sliderRadius, y));

      // Update slider position
      padSlider.style.left = `${x}px`;
      padSlider.style.top = `${y}px`;

      // Update dots based on new slider position
      updateDots(x, y);

      // Calculate varX and varY (-50 to +50, center is 0)
      const normalizedX = ((x - sliderRadius) / (rect.width - sliderRadius * 2)) * 100; // 0-100
      const normalizedY = (1 - (y - sliderRadius) / (rect.height - sliderRadius * 2)) * 100; // 0-100, inverted

      varX = Math.round(normalizedX - 50); // Convert to -50 to +50
      varY = Math.round(normalizedY - 50); // Convert to -50 to +50

      // Update displays
      if (padValueX) padValueX.textContent = varX;
      if (padValueY) padValueY.textContent = varY;

      // Expose variables globally for reuse
      window.padVarX = varX;
      window.padVarY = varY;
    }

    padSlider.addEventListener('mousedown', (e) => {
      isDragging = true;
      padSlider.classList.add('scaled');
      padSlider.style.cursor = 'grabbing';
      e.preventDefault();
    });

    pad2d.addEventListener('mousedown', (e) => {
      if (e.target === pad2d || e.target === padSlider) {
        isDragging = true;
        padSlider.classList.add('scaled');
        updatePadPosition(e.clientX, e.clientY);
        e.preventDefault();
      }
    });

    padSlider.addEventListener('mouseenter', () => {
      if (!isDragging) {
        padSlider.classList.add('scaled');
      }
    });

    padSlider.addEventListener('mouseleave', () => {
      if (!isDragging) {
        padSlider.classList.remove('scaled');
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        updatePadPosition(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        padSlider.classList.remove('scaled');
        padSlider.style.cursor = 'grab';
      }
    });

    // Initialize position and values
    const rect = pad2d.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    padSlider.style.left = `${centerX}px`;
    padSlider.style.top = `${centerY}px`;
    window.padVarX = varX;
    window.padVarY = varY;

    // Initial dot update
    updateDots(centerX, centerY);
  }

  // --- Negative Slider Interaction ---
  const negativeSliderTrackContainer = document.getElementById('negativeSliderTrackContainer');
  const negativeSliderTicks = document.getElementById('negativeSliderTicks');
  const negativeSliderValue = document.getElementById('negativeSliderValue');
  const negativeSliderCenterMarker = document.querySelector('.negative-slider-center-marker');

  if (negativeSliderTrackContainer && negativeSliderTicks) {
    let currentValue = 0;
    let targetValue = 0; // Target value for lerp
    let isDragging = false;
    let startX = 0;
    let startValue = 0;

    // Configuration
    const tickSpacing = 10; // Pixels between ticks
    const totalTicks = 60; // Enough to cover the view plus buffer
    const sensitivity = 0.5; // Value change per pixel
    const lerpFactor = 0.15; // Smoothing factor (0-1)

    // Generate ticks
    for (let i = 0; i < totalTicks; i++) {
      const tick = document.createElement('div');
      tick.classList.add('negative-slider-tick');
      negativeSliderTicks.appendChild(tick);
    }

    const ticks = Array.from(negativeSliderTicks.children);

    function updateTicks() {
      // Lerp current value towards target value
      currentValue += (targetValue - currentValue) * lerpFactor;

      // Stop updating if close enough (optimization)
      if (Math.abs(targetValue - currentValue) < 0.01 && !isDragging) {
        currentValue = targetValue;
      } else {
        requestAnimationFrame(updateTicks);
      }

      const containerWidth = negativeSliderTrackContainer.offsetWidth; // Use container width
      const centerX = containerWidth / 2;

      // Calculate offset based on current value
      // We want value 0 to be at center
      // Positive value moves ticks right (content moves right as we drag right)
      const offset = currentValue * (tickSpacing / sensitivity);

      ticks.forEach((tick, index) => {
        // Calculate tick position in the infinite strip
        // We use modulo to recycle ticks
        const totalStripWidth = totalTicks * tickSpacing;

        // Base position relative to center, including scroll offset
        let pos = (index * tickSpacing + offset) % totalStripWidth;

        // Adjust pos to be centered around 0
        if (pos > totalStripWidth / 2) pos -= totalStripWidth;
        if (pos < -totalStripWidth / 2) pos += totalStripWidth;

        // Screen position (relative to container left)
        const screenPos = centerX + pos;

        // Distance from center (0 is center)
        const dist = Math.abs(pos);

        // Visual properties based on distance from center
        // Max height at center: 16px
        // Min height at edges: 4px
        // Opacity fades out

        const maxDist = 150; // Distance where tick disappears/minimizes
        let influence = 1 - Math.min(dist / maxDist, 1);

        // Apply easing to influence for smoother falloff
        influence = Math.pow(influence, 1.5);

        // Calculate scale based on influence
        // Max height 16px (scale 1), Min height 4px (scale 0.25)
        const minScale = 0.25; // 4px / 16px
        const scaleY = minScale + ((1 - minScale) * influence);

        const opacity = 0.2 + (0.8 * influence); // 0.2 to 1.0

        tick.style.left = `${screenPos}px`;
        // Use transform for performant scaling and centering
        tick.style.transform = `translateY(-50%) scaleY(${scaleY})`;
        tick.style.opacity = opacity;

        // Hide ticks that wrap around too abruptly or are out of view
        if (screenPos < -10 || screenPos > containerWidth + 10) {
          tick.style.display = 'none';
        } else {
          tick.style.display = 'block';
        }
      });

      // Update value display
      if (negativeSliderValue && document.activeElement !== negativeSliderValue) {
        negativeSliderValue.value = Math.round(currentValue);
      }

      // Show/hide center marker based on value (optional, currently using ticks for feedback)
      if (negativeSliderCenterMarker) {
        // Show marker when close to 0
        if (Math.abs(currentValue) < 1) {
          negativeSliderCenterMarker.style.opacity = 1;
        } else {
          negativeSliderCenterMarker.style.opacity = 0;
        }
      }
    }

    // Drag interaction
    negativeSliderTrackContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startValue = targetValue; // Start from current target
      negativeSliderTrackContainer.style.cursor = 'grabbing';
      e.preventDefault();
      // Ensure loop is running
      requestAnimationFrame(updateTicks);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - startX;
        // Update target value immediately
        targetValue = startValue + (dx * sensitivity);
        // Loop is already running via mousedown or previous frame
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        negativeSliderTrackContainer.style.cursor = 'ew-resize';
      }
    });

    // Input interaction
    negativeSliderValue.addEventListener('change', () => {
      const newValue = parseFloat(negativeSliderValue.value);
      if (!isNaN(newValue)) {
        targetValue = newValue;
        // If not dragging, start animation to new value
        if (!isDragging) {
          requestAnimationFrame(updateTicks);
        }
      }
    });

    negativeSliderValue.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        negativeSliderValue.blur();
        return;
      }

      // Allow navigation and control keys
      if (['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
        return;
      }

      // Allow Ctrl/Cmd combinations (copy/paste/select all)
      if (e.ctrlKey || e.metaKey) {
        return;
      }

      // Allow numbers, minus sign, and decimal point
      if (/^[0-9.-]$/.test(e.key)) {
        return;
      }

      // Prevent everything else
      e.preventDefault();
    });

    // Initial update
    // Wait for layout to ensure container width is correct
    requestAnimationFrame(updateTicks);
    // Also update on resize
    window.addEventListener('resize', () => requestAnimationFrame(updateTicks));
  }

  // --- Scale Wheel Interaction ---
  const scaleWheelTrack = document.getElementById('scaleWheelTrack');
  const scaleWheelHandle = document.getElementById('scaleWheelHandle');
  const scaleWheelValue = document.getElementById('scaleWheelValue');

  if (scaleWheelTrack && scaleWheelHandle && scaleWheelValue) {
    let isDragging = false;
    let currentRadius = 22; // Initial radius (44px width / 2)
    const maxRadius = 105 / 2; // Track radius

    function updateWheel(clientX, clientY) {
      const rect = scaleWheelTrack.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance from center
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      let dist = Math.sqrt(dx * dx + dy * dy);

      // Clamp distance to max radius
      dist = Math.min(dist, maxRadius);

      // Update handle size (diameter = 2 * dist)
      // But we want the handle to be grabbable, so maybe we shouldn't let it go to 0?
      // Prompt says "Minimum: 0". Let's clamp to a tiny min to avoid layout issues or 0.
      // Actually, if it goes to 0, you can't grab it again easily unless we handle click on track.
      // Let's set a minimum interactive size or handle track clicks.
      // For now, let's allow it to go small but maybe not 0 px visually if we want to keep it usable?
      // Or maybe the interaction is: click anywhere on track to set size?
      // "Dragging this handle should let the user scale" implies dragging the handle.
      // If it becomes 0, you can't drag it.
      // Let's assume min size is small, e.g., 10px, or we allow clicking on track to reset/expand.
      // Let's stick to dragging for now, but maybe clamp min to 10px for usability.

      const minRadius = 0;
      // If user drags inside, dist becomes the new radius.

      currentRadius = dist;

      // Update visual
      const diameter = currentRadius * 2;
      scaleWheelHandle.style.width = `${diameter}px`;
      scaleWheelHandle.style.height = `${diameter}px`;
      // Update value (0-100 based on radius/maxRadius)
      const percentage = Math.round((currentRadius / maxRadius) * 100);
      scaleWheelValue.textContent = percentage;

      // Scale text from 1 to 1.8 based on percentage
      const textScale = 1 + (percentage / 100) * 0.3;
      scaleWheelValue.style.transform = `translate(-50%, -50%) scale(${textScale})`;
    }

    scaleWheelHandle.addEventListener('mousedown', (e) => {
      isDragging = true;
      scaleWheelHandle.style.cursor = 'grabbing';
      e.preventDefault();
      e.stopPropagation();
    });

    // Also allow clicking on track to jump to size?
    scaleWheelTrack.addEventListener('mousedown', (e) => {
      if (e.target === scaleWheelTrack) {
        isDragging = true;
        scaleWheelHandle.style.cursor = 'grabbing';
        updateWheel(e.clientX, e.clientY);
        e.preventDefault();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        updateWheel(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        scaleWheelHandle.style.cursor = 'grab';
      }
    });
  }

  // --- Range Slider Interaction ---
  const sliderInput = document.getElementById('sliderInput');
  const progressFill = document.getElementById('progressFill');
  const sliderKnob = document.getElementById('sliderKnob');
  const currentValueDisplay = document.getElementById('currentValue');

  function updateSlider() {
    const value = sliderInput.value;
    const max = sliderInput.max;
    const percentage = (value / max) * 100;

    // Update visual elements
    progressFill.style.width = `${percentage}%`;
    sliderKnob.style.left = `${percentage}%`;
    currentValueDisplay.textContent = value;
  }

  if (sliderInput) {
    sliderInput.addEventListener('input', updateSlider);
    // Initialize
    updateSlider();
  }

  // --- Preset Management ---
  const presetDropdownWrapper = document.getElementById('presetDropdownWrapper');
  const presetDropdownTrigger = document.getElementById('presetDropdownTrigger');
  const presetDropdownMenu = document.getElementById('presetDropdownMenu');
  const presetCurrent = document.getElementById('presetCurrent');
  const savePresetBtn = document.getElementById('savePresetBtn');

  if (presetDropdownWrapper && savePresetBtn) {
    // Default preset
    const defaultPreset = {
      name: 'DEFAULT',
      potentiometers: [0, 0, 0, 0], // Normalized 0-1
      pad: { x: 0, y: 0 },
      negativeSlider: 0,
      scaleWheel: 38, // Percentage
      switches: [true, false, true], // Animate, Auto Play, Loop
      function: 'sinus'
    };

    let presets = JSON.parse(localStorage.getItem('dui_presets')) || [defaultPreset];

    function saveCurrentState(name) {
      // Gather state
      const state = {
        name: name,
        potentiometers: [],
        pad: { x: window.padVarX || 0, y: window.padVarY || 0 },
        negativeSlider: parseFloat(negativeSliderValue ? negativeSliderValue.value : 0),
        scaleWheel: parseInt(scaleWheelValue ? scaleWheelValue.textContent : 0),
        switches: [],
        function: document.querySelector('.dropdown-item.selected')?.dataset.value || 'sinus'
      };

      // Potentiometers
      document.querySelectorAll('.potentiometer').forEach(pot => {
        // We need a way to get the value. 
        // Currently values are stored in UI text or rotation.
        // Let's grab the text content
        const val = parseInt(pot.querySelector('.knob-value').textContent);
        state.potentiometers.push(val);
      });

      // Switches
      document.querySelectorAll('.radio-box').forEach(box => {
        state.switches.push(box.dataset.active === 'true');
      });

      return state;
    }

    function loadPreset(preset) {
      // Apply Potentiometers
      const pots = document.querySelectorAll('.potentiometer');
      preset.potentiometers.forEach((val, index) => {
        if (pots[index]) {
          // We need to update the rotation and value display
          // This requires reverse engineering the rotation from value (0-100)
          // Rotation range: -135 to 135 (270 deg total)
          const rotation = (val / 100) * 270 - 135;
          const knobContainer = pots[index].querySelector('.knob-container');
          const knobValue = pots[index].querySelector('.knob-value');
          const rotatingFrame = pots[index].querySelector('.knob-rotating-frame');

          if (knobValue) knobValue.textContent = val;
          if (rotatingFrame) rotatingFrame.style.transform = `rotate(${rotation}deg)`;

          // Update ticks visual
          // We need to trigger the tick update logic. 
          // Best way is to expose the updateKnobVisuals function or replicate it.
          // Since the code is modular, we might need to trigger an event or call a shared function.
          // For now, let's just update the rotation which is the main visual.
          // Ideally, we'd refactor the knob logic to be callable.
        }
      });

      // Apply Pad
      if (typeof updatePadPosition === 'function' && pad2d) {
        // We have x/y values (-50 to 50). Need to convert to pixels.
        const rect = pad2d.getBoundingClientRect();
        const sliderRadius = 13.5;
        // varX = ((x - r) / w) * 100 - 50
        // (varX + 50) / 100 = (x - r) / w
        // x = ((varX + 50) / 100) * (rect.width - 2*r) + r

        // Note: rect.width might be 0 if hidden or not layout yet. 
        // Assuming fixed size 200x200 from CSS if rect fails
        const width = rect.width || 200;
        const height = rect.height || 200;

        const x = ((preset.pad.x + 50) / 100) * (width - sliderRadius * 2) + sliderRadius;
        const y = (1 - (preset.pad.y + 50) / 100) * (height - sliderRadius * 2) + sliderRadius; // Inverted Y

        // Update UI
        padSlider.style.left = `${x}px`;
        padSlider.style.top = `${y}px`;
        window.padVarX = preset.pad.x;
        window.padVarY = preset.pad.y;
        if (padValueX) padValueX.textContent = preset.pad.x;
        if (padValueY) padValueY.textContent = preset.pad.y;
        if (typeof updateDots === 'function') updateDots(x, y);
      }

      // Apply Negative Slider
      if (negativeSliderValue) {
        negativeSliderValue.value = preset.negativeSlider;
        // Trigger change event to update ticks
        negativeSliderValue.dispatchEvent(new Event('change'));
      }

      // Apply Scale Wheel
      if (scaleWheelValue) {
        // Percentage to radius
        // percentage = (r / max) * 100
        // r = (percentage / 100) * max
        const maxRadius = 105 / 2;
        const r = (preset.scaleWheel / 100) * maxRadius;
        const diameter = r * 2;

        scaleWheelHandle.style.width = `${diameter}px`;
        scaleWheelHandle.style.height = `${diameter}px`;
        scaleWheelValue.textContent = preset.scaleWheel;

        // Update text scale
        const textScale = 1 + (preset.scaleWheel / 100) * 0.3;
        scaleWheelValue.style.transform = `translate(-50%, -50%) scale(${textScale})`;
      }

      // Apply Switches
      const switches = document.querySelectorAll('.radio-box');
      preset.switches.forEach((state, index) => {
        if (switches[index]) {
          switches[index].dataset.active = state;
        }
      });

      // Apply Function
      const funcItems = document.querySelectorAll('.dropdown-item');
      funcItems.forEach(item => {
        if (item.dataset.value === preset.function) {
          item.click(); // Reuse existing click logic
        }
      });

      presetCurrent.textContent = preset.name;
    }

    function renderPresets() {
      presetDropdownMenu.innerHTML = '';
      presets.forEach((preset, index) => {
        const item = document.createElement('div');
        item.classList.add('dropdown-item');
        if (preset.name === presetCurrent.textContent) item.classList.add('selected');
        item.textContent = preset.name;
        item.addEventListener('click', () => {
          loadPreset(preset);
          presetDropdownWrapper.classList.remove('open');
          renderPresets(); // Re-render to update selected state
        });

        // Add delete button for non-default
        if (index > 0) {
          // Optional: Add delete functionality
        }

        presetDropdownMenu.appendChild(item);
      });
    }

    // Event Listeners
    presetDropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      presetDropdownWrapper.classList.toggle('open');
    });

    savePresetBtn.addEventListener('click', () => {
      const name = prompt('Enter preset name:', `Preset ${presets.length}`);
      if (name) {
        // Check if exists
        const existingIndex = presets.findIndex(p => p.name === name);
        const newState = saveCurrentState(name);

        if (existingIndex >= 0) {
          if (confirm(`Overwrite preset "${name}"?`)) {
            presets[existingIndex] = newState;
          } else {
            return;
          }
        } else {
          presets.push(newState);
        }

        localStorage.setItem('dui_presets', JSON.stringify(presets));
        renderPresets();
        loadPreset(newState); // Select it
      }
    });

    // Initial Render
    renderPresets();

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!presetDropdownWrapper.contains(e.target)) {
        presetDropdownWrapper.classList.remove('open');
      }
    });
  }

  // --- Potentiometer Interaction ---
  const potentiometers = document.querySelectorAll('.knob-container');

  potentiometers.forEach((knobContainer) => {
    const knobRotatingFrame = knobContainer.querySelector('.knob-rotating-frame');
    const knobValueDisplay = knobContainer.closest('.potentiometer').querySelector('.knob-value');
    const knobTicksContainer = knobContainer.querySelector('.knob-ticks');

    let isDraggingKnob = false;
    let startAngle = 0;
    let currentRotation = 0;
    let previousAngle = 0;

    function getAngle(x, y, rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
    }

    function updateKnobValue(rotation) {
      const normalized = rotation + 135;
      const percentage = Math.round((normalized / 270) * 100);
      const clamped = Math.max(0, Math.min(100, percentage));
      if (knobValueDisplay) {
        knobValueDisplay.textContent = clamped;
      }
    }

    function updateTicks(rotation) {
      const ticks = knobTicksContainer.querySelectorAll('.tick');
      ticks.forEach(tick => {
        const tickAngle = parseFloat(tick.getAttribute('data-angle'));
        const isActive = rotation >= tickAngle;
        const scale = isActive ? 1.1 : 0.8;

        if (isActive) {
          tick.classList.add('active');
        } else {
          tick.classList.remove('active');
        }

        // Update transform to include scale
        const currentTransform = tick.getAttribute('data-base-transform');
        tick.style.transform = `${currentTransform} scale(${scale})`;
      });
    }

    // Generate ticks for this knob
    if (knobTicksContainer) {
      const startAngle = -135;
      const endAngle = 135;
      const totalTicks = 40;

      // Check if this is a scaled potentiometer
      const isScaled = knobContainer.closest('.potentiometer').classList.contains('scale');
      // For 128px container: -72px radius
      // For 100px container: -56px radius (to maintain same visual spacing)
      const tickRadius = isScaled ? -56 : -72;

      for (let i = 0; i <= totalTicks; i++) {
        const tick = document.createElement('div');
        tick.classList.add('tick');
        const angle = startAngle + (i / totalTicks) * (endAngle - startAngle);
        tick.setAttribute('data-angle', angle);

        // Store base transform (without scale) for later updates
        const baseTransform = `rotate(${angle}deg) translateY(${tickRadius}px)`;
        tick.setAttribute('data-base-transform', baseTransform);
        tick.style.transform = `${baseTransform} scale(0.8)`;

        knobTicksContainer.appendChild(tick);
      }
    }

    if (knobContainer && knobRotatingFrame) {
      // Initial value update
      updateKnobValue(currentRotation);
      setTimeout(() => updateTicks(currentRotation), 0);

      knobContainer.addEventListener('mousedown', (e) => {
        isDraggingKnob = true;
        const rect = knobContainer.getBoundingClientRect();
        const angle = getAngle(e.clientX, e.clientY, rect);
        startAngle = angle - currentRotation;
        previousAngle = angle;
        knobContainer.style.cursor = 'grabbing';
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDraggingKnob) return;

        const rect = knobContainer.getBoundingClientRect();
        const angle = getAngle(e.clientX, e.clientY, rect);

        let angleDelta = angle - previousAngle;

        if (angleDelta > 180) angleDelta -= 360;
        if (angleDelta < -180) angleDelta += 360;

        let newRotation = currentRotation + angleDelta;

        if (newRotation > 135) {
          newRotation = 135;
        } else if (newRotation < -135) {
          newRotation = -135;
        }

        previousAngle = angle;
        currentRotation = newRotation;
        knobRotatingFrame.style.transform = `rotate(${currentRotation}deg)`;
        updateKnobValue(currentRotation);
        updateTicks(currentRotation);
      });

      window.addEventListener('mouseup', () => {
        if (isDraggingKnob) {
          isDraggingKnob = false;
          knobContainer.style.cursor = 'grab';
        }
      });
    }
  });

  // --- Radio Box Interaction ---
  const radioBoxes = document.querySelectorAll('.radio-box');

  radioBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const isActive = box.getAttribute('data-active') === 'true';
      // Toggle state
      box.setAttribute('data-active', !isActive);
    });
  });

  // --- Player Card Interaction ---
  const playPauseBtn = document.getElementById('playPauseBtn');
  const refreshBtn = document.getElementById('refreshBtn');

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      const isPlaying = playPauseBtn.getAttribute('data-playing') === 'true';

      if (isPlaying) {
        // Pause state
        playPauseBtn.setAttribute('data-playing', 'false');
        playPauseBtn.title = "Play";
        playPauseBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4L12 8L6 12V4Z" fill="#1B1B1B"/>
          </svg>
        `;
      } else {
        // Play state
        playPauseBtn.setAttribute('data-playing', 'true');
        playPauseBtn.title = "Pause";
        playPauseBtn.innerHTML = `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.39983 3.76123C6.7987 3.76123 7.12206 4.08458 7.12206 4.48346L7.12207 11.5168C7.12207 11.9156 6.79872 12.239 6.39984 12.239L5.69666 12.239C5.29778 12.239 4.97443 11.9156 4.97443 11.5168L4.97443 4.48346C4.97443 4.08459 5.29778 3.76124 5.69666 3.76124L6.39983 3.76123Z" fill="#C2C2C2"/>
<path d="M6.39983 3.76123C6.7987 3.76123 7.12206 4.08458 7.12206 4.48346L7.12207 11.5168C7.12207 11.9156 6.79872 12.239 6.39984 12.239L5.69666 12.239C5.29778 12.239 4.97443 11.9156 4.97443 11.5168L4.97443 4.48346C4.97443 4.08459 5.29778 3.76124 5.69666 3.76124L6.39983 3.76123Z" fill="#1B1B1B"/>
<path d="M10.3031 3.76123C10.702 3.76123 11.0254 4.08458 11.0254 4.48346L11.0254 11.5168C11.0254 11.9156 10.702 12.239 10.3031 12.239L9.59998 12.239C9.2011 12.239 8.87775 11.9156 8.87775 11.5168L8.87775 4.48346C8.87775 4.08459 9.2011 3.76124 9.59998 3.76124L10.3031 3.76123Z" fill="#C2C2C2"/>
<path d="M10.3031 3.76123C10.702 3.76123 11.0254 4.08458 11.0254 4.48346L11.0254 11.5168C11.0254 11.9156 10.702 12.239 10.3031 12.239L9.59998 12.239C9.2011 12.239 8.87775 11.9156 8.87775 11.5168L8.87775 4.48346C8.87775 4.08459 9.2011 3.76124 9.59998 3.76124L10.3031 3.76123Z" fill="#1B1B1B"/>
</svg>

        `;
      }
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      // Add rotation animation or reset logic here
      const icon = refreshBtn.querySelector('svg');
      icon.style.transition = 'transform 0.5s ease';
      icon.style.transform = 'rotate(-360deg)';
      setTimeout(() => {
        icon.style.transition = 'none';
        icon.style.transform = 'rotate(0deg)';
      }, 500);
    });
  }

  // --- Radio Controls Interaction ---
  const playPauseRadio = document.getElementById('playPauseRadio');
  const refreshRadio = document.getElementById('refreshRadio');

  if (playPauseRadio) {
    playPauseRadio.addEventListener('click', () => {
      const currentState = playPauseRadio.getAttribute('data-state');

      if (currentState === 'play') {
        // Switch to pause
        playPauseRadio.setAttribute('data-state', 'pause');
        playPauseRadio.innerHTML = `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.39983 3.76123C6.7987 3.76123 7.12206 4.08458 7.12206 4.48346L7.12207 11.5168C7.12207 11.9156 6.79872 12.239 6.39984 12.239L5.69666 12.239C5.29778 12.239 4.97443 11.9156 4.97443 11.5168L4.97443 4.48346C4.97443 4.08459 5.29778 3.76124 5.69666 3.76124L6.39983 3.76123Z" fill="#C2C2C2"/>
<path d="M6.39983 3.76123C6.7987 3.76123 7.12206 4.08458 7.12206 4.48346L7.12207 11.5168C7.12207 11.9156 6.79872 12.239 6.39984 12.239L5.69666 12.239C5.29778 12.239 4.97443 11.9156 4.97443 11.5168L4.97443 4.48346C4.97443 4.08459 5.29778 3.76124 5.69666 3.76124L6.39983 3.76123Z" fill="#1B1B1B"/>
<path d="M10.3031 3.76123C10.702 3.76123 11.0254 4.08458 11.0254 4.48346L11.0254 11.5168C11.0254 11.9156 10.702 12.239 10.3031 12.239L9.59998 12.239C9.2011 12.239 8.87775 11.9156 8.87775 11.5168L8.87775 4.48346C8.87775 4.08459 9.2011 3.76124 9.59998 3.76124L10.3031 3.76123Z" fill="#C2C2C2"/>
<path d="M10.3031 3.76123C10.702 3.76123 11.0254 4.08458 11.0254 4.48346L11.0254 11.5168C11.0254 11.9156 10.702 12.239 10.3031 12.239L9.59998 12.239C9.2011 12.239 8.87775 11.9156 8.87775 11.5168L8.87775 4.48346C8.87775 4.08459 9.2011 3.76124 9.59998 3.76124L10.3031 3.76123Z" fill="#1B1B1B"/>
</svg>

        `;
      } else {
        // Switch to play
        playPauseRadio.setAttribute('data-state', 'play');
        playPauseRadio.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4L12 8L6 12V4Z" fill="#1B1B1B"/>
          </svg>
        `;
      }
    });
  }

  if (refreshRadio) {
    refreshRadio.addEventListener('click', () => {
      // Add active state temporarily
      refreshRadio.classList.add('active');

      // Rotate the icon
      const icon = refreshRadio.querySelector('svg');
      if (icon) {
        icon.style.transition = 'transform 0.5s ease';
        icon.style.transform = 'rotate(-360deg)';

        setTimeout(() => {
          icon.style.transition = 'none';
          icon.style.transform = 'rotate(0deg)';
          refreshRadio.classList.remove('active');
        }, 500);
      }
    });
  }

  // --- Footer Controls Interaction ---
  const footerPlayBtn = document.getElementById('footerPlayBtn');
  const footerRefreshBtn = document.getElementById('footerRefreshBtn');

  if (footerPlayBtn) {
    footerPlayBtn.addEventListener('click', () => {
      const isActive = footerPlayBtn.classList.contains('active');

      if (isActive) {
        // Switch to pause state
        footerPlayBtn.classList.remove('active');
        footerPlayBtn.querySelector('.footer-player-inner').innerHTML = `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.39983 3.76123C6.7987 3.76123 7.12206 4.08458 7.12206 4.48346L7.12207 11.5168C7.12207 11.9156 6.79872 12.239 6.39984 12.239L5.69666 12.239C5.29778 12.239 4.97443 11.9156 4.97443 11.5168L4.97443 4.48346C4.97443 4.08459 5.29778 3.76124 5.69666 3.76124L6.39983 3.76123Z" fill="#C2C2C2"/>
<path d="M6.39983 3.76123C6.7987 3.76123 7.12206 4.08458 7.12206 4.48346L7.12207 11.5168C7.12207 11.9156 6.79872 12.239 6.39984 12.239L5.69666 12.239C5.29778 12.239 4.97443 11.9156 4.97443 11.5168L4.97443 4.48346C4.97443 4.08459 5.29778 3.76124 5.69666 3.76124L6.39983 3.76123Z" fill="#1B1B1B"/>
<path d="M10.3031 3.76123C10.702 3.76123 11.0254 4.08458 11.0254 4.48346L11.0254 11.5168C11.0254 11.9156 10.702 12.239 10.3031 12.239L9.59998 12.239C9.2011 12.239 8.87775 11.9156 8.87775 11.5168L8.87775 4.48346C8.87775 4.08459 9.2011 3.76124 9.59998 3.76124L10.3031 3.76123Z" fill="#C2C2C2"/>
<path d="M10.3031 3.76123C10.702 3.76123 11.0254 4.08458 11.0254 4.48346L11.0254 11.5168C11.0254 11.9156 10.702 12.239 10.3031 12.239L9.59998 12.239C9.2011 12.239 8.87775 11.9156 8.87775 11.5168L8.87775 4.48346C8.87775 4.08459 9.2011 3.76124 9.59998 3.76124L10.3031 3.76123Z" fill="#1B1B1B"/>
</svg>

          <span class="footer-player-text">Pause</span>
        `;
      } else {
        // Switch to play state
        footerPlayBtn.classList.add('active');
        footerPlayBtn.querySelector('.footer-player-inner').innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.1749 7.39603C11.621 7.67542 11.621 8.32518 11.1749 8.60457L6.49786 11.5342C6.02298 11.8316 5.40634 11.4903 5.40634 10.9299L5.40634 5.07068C5.40634 4.51033 6.02298 4.16896 6.49786 4.46642L11.1749 7.39603Z" fill="#1B1B1B"/>
          </svg>
          <span class="footer-player-text">Play</span>
        `;
      }
    });
  }

  if (footerRefreshBtn) {
    footerRefreshBtn.addEventListener('click', () => {
      // Add active state temporarily
      footerRefreshBtn.classList.add('active');

      // Rotate the icon
      const icon = footerRefreshBtn.querySelector('svg');
      if (icon) {
        icon.style.transition = 'transform 0.5s ease';
        icon.style.transform = 'rotate(-360deg)';

        setTimeout(() => {
          icon.style.transition = 'none';
          icon.style.transform = 'rotate(0deg)';
          footerRefreshBtn.classList.remove('active');
        }, 500);
      }
    });
  }

  // --- Dropdown Interaction & Preview ---
  const dropdownWrapper = document.getElementById('dropdownWrapper');
  const dropdownTrigger = document.getElementById('dropdownTrigger');
  const counterCurrent = document.getElementById('counterCurrent');
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const previewCanvas = document.getElementById('previewCanvas');
  const previewLabel = document.getElementById('previewLabel');

  let currentFunction = 'sinus'; // Default
  let animationId;
  let time = 0;

  function renderPreview() {
    if (!previewCanvas) return;
    const ctx = previewCanvas.getContext('2d');
    const width = previewCanvas.parentElement.clientWidth;
    const height = previewCanvas.parentElement.clientHeight;

    // Handle DPI
    const dpr = window.devicePixelRatio || 1;
    previewCanvas.width = width * dpr;
    previewCanvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = '#919191';
    ctx.lineWidth = 1.5;

    const amplitude = 20;
    const frequency = 0.05;
    const speed = 0.1; // Animation speed
    const centerY = height / 2;

    for (let x = 0; x < width; x++) {
      let y = centerY;
      // Add time to x for animation
      const t = x + time;

      if (currentFunction === 'sinus') {
        y += Math.sin(t * frequency) * amplitude;
      } else if (currentFunction === 'cosinus') {
        y += Math.cos(t * frequency) * amplitude;
      } else if (currentFunction === 'tangente') {
        y += Math.tan(t * frequency * 0.5) * 5; // Reduced amplitude for tan
      }

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    time += speed * 20; // Increment time
    animationId = requestAnimationFrame(renderPreview);
  }

  if (dropdownWrapper && dropdownTrigger) {
    // Toggle dropdown
    dropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownWrapper.classList.toggle('open');
    });

    // Select item
    dropdownItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        e.stopPropagation();
        const value = item.getAttribute('data-value');
        const index = item.getAttribute('data-index');
        const text = item.textContent;

        // Update counter
        if (counterCurrent) {
          counterCurrent.textContent = index;
        }

        // Update preview label
        if (previewLabel) {
          previewLabel.textContent = text;
        }

        // Update selected state
        dropdownItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        // Close dropdown
        dropdownWrapper.classList.remove('open');

        // Update function and redraw
        currentFunction = value;
        // renderPreview is already running in loop, no need to call it again or it will stack requestAnimationFrame
        // renderPreview(); 
      });
    });

    // Close on outside click
    document.addEventListener('click', () => {
      dropdownWrapper.classList.remove('open');
    });

    // Initial draw
    renderPreview();
    window.addEventListener('resize', () => {
      // No need to restart animation loop, it's running
    });
  }

});

