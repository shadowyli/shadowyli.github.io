<script setup lang="ts">
import {
  computed,
  isVNode,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  type CSSProperties,
  type VNode
} from 'vue';

export type GridMotionItem = string | number | boolean | null | undefined | VNode | { src: string; alt?: string };
export type GridMotionDirection = 'alternate' | 'left' | 'right';

export interface GridMotionProps {
  items?: GridMotionItem[];
  rows?: number;
  aspectRatio?: number;
  gap?: number;
  radius?: number;
  angle?: number;
  tilt?: number;
  speed?: number;
  direction?: GridMotionDirection;
  parallax?: number;
  spotlight?: number;
  dim?: number;
  grayscale?: boolean;
  fade?: number;
  tileColor?: string;
  textColor?: string;
  theme?: 'dark' | 'light';
  className?: string;
  style?: CSSProperties;
  paused?: boolean;
}

type TileData =
  | { kind: 'empty' }
  | { kind: 'node'; node: VNode }
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'text'; text: string };

const THEMES = {
  dark: { tile: '#1a1c1a', text: 'rgba(255, 255, 255, 0.78)', border: 'rgba(255, 255, 255, 0.07)' },
  light: { tile: '#f3f5f3', text: '#3d423e', border: 'rgba(22, 24, 22, 0.08)' }
};
const DIRECTIONS: GridMotionDirection[] = ['alternate', 'left', 'right'];
const IMAGE = /^(https?:\/\/|\/\/|\/|\.\.?\/|data:image\/|blob:)|\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i;
const INERTIA = [0.42, 0.32, 0.26, 0.22];
const PACE = [1, 0.86, 1.12, 0.94];
const EMPTY: TileData = { kind: 'empty' };

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));
const wrap = (value: number, total: number) => ((value % total) + total) % total;
const smoothstep = (edgeStart: number, edgeEnd: number, value: number) => {
  const amount = clamp((value - edgeStart) / (edgeEnd - edgeStart), 0, 1);
  return amount * amount * (3 - 2 * amount);
};
const feather = (side: string, zone: number) => {
  const stops: string[] = [];
  const mirrored: string[] = [];
  for (let index = 0; index <= 12; index++) {
    const amount = index / 12;
    const alpha = amount ** 3 * (amount * (amount * 6 - 15) + 10);
    stops.push('rgba(0, 0, 0, ' + alpha.toFixed(4) + ') ' + (amount * zone).toFixed(2) + '%');
    mirrored.unshift('rgba(0, 0, 0, ' + alpha.toFixed(4) + ') ' + (100 - amount * zone).toFixed(2) + '%');
  }
  return 'linear-gradient(' + side + ', ' + stops.join(', ') + ', ' + mirrored.join(', ') + ')';
};
const toTile = (item: GridMotionItem): TileData => {
  if (item === null || item === undefined || item === false) return EMPTY;
  if (isVNode(item)) return { kind: 'node', node: item };
  if (typeof item === 'object' && 'src' in item && typeof item.src === 'string') {
    return { kind: 'image', src: item.src, alt: item.alt ?? '' };
  }
  const text = String(item).trim();
  return IMAGE.test(text) ? { kind: 'image', src: text, alt: '' } : { kind: 'text', text };
};

const props = withDefaults(defineProps<GridMotionProps>(), {
  items: () => [],
  rows: 4,
  aspectRatio: 1.33,
  gap: 16,
  radius: 14,
  angle: -12,
  tilt: 0,
  speed: 24,
  direction: 'alternate',
  parallax: 0.5,
  spotlight: 0.6,
  dim: 0.35,
  grayscale: false,
  fade: 0.5,
  tileColor: undefined,
  textColor: undefined,
  theme: 'dark',
  className: '',
  style: undefined,
  paused: false
});

const rootRef = ref<HTMLDivElement | null>(null);
const planeRef = ref<HTMLDivElement | null>(null);
const motion = {
  offsets: [] as number[],
  shifts: [] as number[],
  intro: 0,
  pointer: { x: 0, y: 0, active: false }
};
const size = shallowRef({ width: 0, height: 0 });
const palette = computed(() => THEMES[props.theme] ?? THEMES.dark);
const rowCount = computed(() => clamp(Math.round(props.rows), 1, 12));
const aspect = computed(() => clamp(props.aspectRatio, 0.3, 4));
const gapSize = computed(() => Math.max(0, props.gap));
const tiltAngle = computed(() => clamp(props.tilt, 0, 75));
const settings = computed(() => ({
  rows: rowCount.value,
  aspect: aspect.value,
  gap: gapSize.value,
  angle: props.angle,
  tilt: tiltAngle.value,
  speed: props.speed,
  direction: DIRECTIONS.includes(props.direction) ? props.direction : 'alternate',
  parallax: clamp(props.parallax, 0, 1),
  spotlight: clamp(props.spotlight, 0, 1),
  dim: clamp(props.dim, 0, 1),
  fade: clamp(props.fade, 0, 1)
}));
const layout = computed(() => {
  const { width, height } = size.value;
  if (!width || !height) return null;
  const rows = rowCount.value;
  const gap = gapSize.value;
  const turn = props.angle * Math.PI / 180;
  const lean = tiltAngle.value * Math.PI / 180;
  const cosine = Math.abs(Math.cos(turn));
  const sine = Math.abs(Math.sin(turn));
  const planeHeight = (width * sine + height * cosine) / Math.max(0.3, Math.cos(lean)) * 1.12;
  const planeWidth = (width * cosine + height * sine) * (1 + Math.sin(lean) * 0.9) * 1.12;
  const tileHeight = Math.max(16, (planeHeight - gap * (rows - 1)) / rows);
  const tileWidth = tileHeight * aspect.value;
  const step = tileWidth + gap;
  const perRow = Math.max(Math.ceil(planeWidth / step) + 1, Math.ceil(props.items.length / rows));
  const period = perRow * step;
  return {
    planeWidth, planeHeight, tileWidth, tileHeight, step, perRow, period,
    copies: Math.ceil(planeWidth / period) + 2,
    top: (planeHeight - rows * tileHeight - (rows - 1) * gap) / 2,
    perspective: Math.max(width, height) * 1.5
  };
});
const tiles = computed(() => props.items.map(toTile));
const rowTiles = computed(() => {
  const current = layout.value;
  if (!current) return [];
  const list = tiles.value;
  return Array.from({ length: settings.value.rows }, (_, rowIndex) => {
    const sequence = Array.from({ length: current.perRow }, (_, tileIndex) =>
      list.length ? list[(rowIndex * current.perRow + tileIndex) % list.length] : EMPTY
    );
    return Array.from({ length: current.copies * current.perRow }, (_, tileIndex) =>
      sequence[tileIndex % current.perRow]
    );
  });
});
const mask = computed(() => settings.value.fade > 0
  ? feather('to right', settings.value.fade * 34) + ', ' + feather('to bottom', settings.value.fade * 44)
  : undefined
);
const rootClass = computed(() =>
  'grid-motion' + (props.grayscale ? ' grid-motion--gray' : '') + (props.className ? ' ' + props.className : '')
);
const rootStyle = computed(() => ({
  '--gm-tile': props.tileColor ?? palette.value.tile,
  '--gm-text': props.textColor ?? palette.value.text,
  '--gm-border': palette.value.border,
  '--gm-radius': Math.max(0, props.radius) + 'px',
  '--gm-dim': settings.value.dim,
  perspective: layout.value && settings.value.tilt > 0 ? layout.value.perspective + 'px' : undefined,
  maskImage: mask.value,
  WebkitMaskImage: mask.value,
  maskComposite: mask.value ? 'intersect' : undefined,
  WebkitMaskComposite: mask.value ? 'source-in' : undefined,
  ...props.style
}) as CSSProperties);
const planeStyle = computed(() => {
  const current = layout.value;
  if (!current) return {};
  return {
    width: current.planeWidth + 'px',
    height: current.planeHeight + 'px',
    transform: 'translate(-50%, -50%) rotateX(' + settings.value.tilt + 'deg) rotateZ(' + settings.value.angle + 'deg)',
    '--gm-gap': settings.value.gap + 'px',
    '--gm-tile-w': current.tileWidth + 'px',
    '--gm-tile-h': current.tileHeight + 'px',
    '--gm-font': clamp(current.tileHeight * 0.12, 12, 32) + 'px'
  } as CSSProperties;
});

let observer: ResizeObserver | null = null;
const onMove = (event: PointerEvent) => {
  if (event.pointerType === 'touch' || (!settings.value.parallax && !settings.value.spotlight)) return;
  motion.pointer.x = event.clientX;
  motion.pointer.y = event.clientY;
  motion.pointer.active = true;
};
const onLeave = () => { motion.pointer.active = false; };
onMounted(() => {
  const root = rootRef.value;
  if (!root) return;
  observer = new ResizeObserver(() => {
    const width = Math.round(root.clientWidth);
    const height = Math.round(root.clientHeight);
    if (size.value.width !== width || size.value.height !== height) size.value = { width, height };
  });
  observer.observe(root);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('blur', onLeave);
  document.documentElement.addEventListener('pointerleave', onLeave);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('blur', onLeave);
  document.documentElement.removeEventListener('pointerleave', onLeave);
});

watch([layout, tiles, planeRef], ([current], _previous, onCleanup) => {
  const root = rootRef.value;
  const plane = planeRef.value;
  if (!root || !plane || !current) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rowElements = Array.from(plane.children) as HTMLElement[];
  const tileElements = rowElements.map(row => Array.from(row.children) as HTMLElement[]);
  const spots = tileElements.map(list => new Float32Array(list.length));
  const written = tileElements.map(list => new Float32Array(list.length));
  let animation = 0;
  let last = performance.now();
  let visible = false;
  let alive = true;
  let reduced = preference.matches;

  const active = () => alive && visible && !document.hidden && !reduced && !props.paused;
  const frame = (now: number) => {
    animation = 0;
    if (!alive) return;
    const config = settings.value;
    const delta = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    if (reduced || props.paused) motion.intro = 1;
    if (motion.intro < 1) motion.intro = Math.min(1, motion.intro + delta / 0.9);
    plane.style.opacity = String(1 - (1 - motion.intro) ** 3);

    const bounds = root.getBoundingClientRect();
    const scale = bounds.width ? root.clientWidth / bounds.width : 1;
    const halfWidth = root.clientWidth / 2 || 1;
    const halfHeight = root.clientHeight / 2 || 1;
    const pointerX = (motion.pointer.x - bounds.left) * scale - halfWidth;
    const pointerY = (motion.pointer.y - bounds.top) * scale - halfHeight;
    const inside = motion.pointer.active && Math.abs(pointerX) <= halfWidth && Math.abs(pointerY) <= halfHeight;
    const lean = config.tilt * Math.PI / 180;
    const turn = config.angle * Math.PI / 180;
    const depth = current.perspective;
    let flatY = pointerY;
    let flatX = pointerX;
    if (lean > 0.0001) {
      flatY = pointerY * depth / (depth * Math.cos(lean) + pointerY * Math.sin(lean));
      flatX = pointerX * (depth - flatY * Math.sin(lean)) / depth;
    }
    const planeX = flatX * Math.cos(turn) + flatY * Math.sin(turn);
    const planeY = -flatX * Math.sin(turn) + flatY * Math.cos(turn);
    const nudge = inside ? clamp(pointerX / halfWidth, -1, 1) : 0;
    const reach = (0.6 + 2.2 * config.spotlight) * Math.max(current.tileWidth, current.tileHeight);
    const settle = 1 - Math.exp(-delta / 0.22);

    rowElements.forEach((row, rowIndex) => {
      const drift = config.direction === 'left' ? -1 : config.direction === 'right' ? 1 : rowIndex % 2 ? 1 : -1;
      if (motion.offsets[rowIndex] === undefined) {
        motion.offsets[rowIndex] = rowIndex * current.step * 0.37;
        motion.shifts[rowIndex] = 0;
      }
      if (active()) {
        motion.offsets[rowIndex] = wrap(
          motion.offsets[rowIndex] + config.speed * drift * PACE[rowIndex % PACE.length] * delta,
          current.period
        );
        const target = config.parallax * current.tileWidth * 1.2 * nudge * (rowIndex % 2 ? -1 : 1);
        motion.shifts[rowIndex] += (target - motion.shifts[rowIndex]) * (1 - Math.exp(-delta / INERTIA[rowIndex % INERTIA.length]));
      }
      const offset = -current.period + wrap(motion.offsets[rowIndex] + motion.shifts[rowIndex], current.period);
      row.style.transform = 'translate3d(' + offset.toFixed(2) + 'px, 0, 0)';

      const rowY = current.top + rowIndex * (current.tileHeight + config.gap) + current.tileHeight / 2 - current.planeHeight / 2;
      const left = offset - current.planeWidth / 2 + current.tileWidth / 2;
      const list = tileElements[rowIndex];
      const values = spots[rowIndex];
      const marks = written[rowIndex];
      for (let tileIndex = 0; tileIndex < list.length; tileIndex++) {
        let wanted = 0;
        if (inside && config.spotlight > 0 && !reduced) {
          const distance = Math.hypot(left + tileIndex * current.step - planeX, rowY - planeY) / reach;
          wanted = 1 - smoothstep(0.25, 1, distance);
        }
        values[tileIndex] += (wanted - values[tileIndex]) * settle;
        if (Math.abs(values[tileIndex] - marks[tileIndex]) > 0.004 ||
            (wanted === 0 && values[tileIndex] < 0.004 && marks[tileIndex] !== 0)) {
          marks[tileIndex] = values[tileIndex] < 0.004 ? 0 : values[tileIndex];
          list[tileIndex].style.setProperty('--spot', marks[tileIndex].toFixed(3));
        }
      }
    });
    if (active()) animation = requestAnimationFrame(frame);
  };
  const syncPlayback = () => {
    cancelAnimationFrame(animation);
    animation = 0;
    if (document.hidden || !visible) return;
    last = performance.now();
    frame(last);
  };
  const onPreference = () => {
    reduced = preference.matches;
    syncPlayback();
  };
  const visibility = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    syncPlayback();
  });
  const stopPauseWatch = watch(() => props.paused, syncPlayback);
  visibility.observe(root);
  preference.addEventListener('change', onPreference);
  document.addEventListener('visibilitychange', syncPlayback);
  frame(last);

  onCleanup(() => {
    alive = false;
    cancelAnimationFrame(animation);
    visibility.disconnect();
    preference.removeEventListener('change', onPreference);
    document.removeEventListener('visibilitychange', syncPlayback);
    stopPauseWatch();
  });
}, { flush: 'post' });
</script>

<template>
  <div ref="rootRef" :class="rootClass" :style="rootStyle">
    <div v-if="layout" ref="planeRef" class="grid-motion__plane" aria-hidden="true" :style="planeStyle">
      <div
        v-for="(sequence, rowIndex) in rowTiles"
        :key="rowIndex"
        class="grid-motion__row"
        :style="{ top: layout.top + rowIndex * (layout.tileHeight + settings.gap) + 'px' }"
      >
        <div v-for="(tile, tileIndex) in sequence" :key="tileIndex" class="grid-motion__tile">
          <img v-if="tile.kind === 'image'" :src="tile.src" :alt="tile.alt" draggable="false" decoding="async" />
          <span v-else-if="tile.kind === 'text'" class="grid-motion__text">{{ tile.text }}</span>
          <component :is="tile.node" v-else-if="tile.kind === 'node'" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.grid-motion {
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.grid-motion__plane {
  position: absolute;
  top: 50%;
  left: 50%;
  opacity: 0;
}
.grid-motion__row {
  position: absolute;
  left: 0;
  display: flex;
  gap: var(--gm-gap);
  will-change: transform;
}
.grid-motion__tile {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--gm-tile-w);
  height: var(--gm-tile-h);
  overflow: hidden;
  border-radius: var(--gm-radius);
  background: var(--gm-tile);
  color: var(--gm-text);
  font-size: var(--gm-font);
  line-height: 1.2;
  text-align: center;
  opacity: calc(1 - var(--gm-dim) * (1 - var(--spot, 0)));
}
.grid-motion__tile::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px var(--gm-border);
  pointer-events: none;
}
.grid-motion--gray .grid-motion__tile {
  filter: grayscale(calc(1 - var(--spot, 0)));
}
.grid-motion__tile img {
  display: block;
  width: 100%;
  height: 100%;
  padding: var(--gm-image-padding, 0);
  object-fit: var(--gm-image-fit, cover);
  pointer-events: none;
  user-select: none;
}
.grid-motion__text {
  padding: 0 1em;
}
</style>
