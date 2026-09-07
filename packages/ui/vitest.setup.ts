import "@testing-library/jest-dom/vitest"
import { MotionGlobalConfig } from "motion/react"

MotionGlobalConfig.skipAnimations = true

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom's selector engine throws (slowly) on the top-layer pseudo-classes floating-ui probes.
const nativeMatches = Element.prototype.matches
Element.prototype.matches = function (selector: string) {
  if (selector.includes(":popover-open") || selector.includes(":modal")) return false
  return nativeMatches.call(this, selector)
}
