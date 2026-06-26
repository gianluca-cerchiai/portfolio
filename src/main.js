import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

/* ------------------------------------------------------------------
   1. Loader
------------------------------------------------------------------ */
function runLoader() {
  const loader = document.getElementById("loader")
  const count = document.getElementById("loaderCount")
  const bar = document.getElementById("loaderBar")

  if (reduceMotion) {
    loader.style.display = "none"
    introAnimation()
    return
  }

  const counter = { value: 0 }
  const tl = gsap.timeline({ onComplete: introAnimation })

  tl.to(counter, {
    value: 100,
    duration: 1.6,
    ease: "power2.inOut",
    onUpdate: () => {
      count.textContent = String(Math.round(counter.value)).padStart(2, "0")
    },
  })
    .to(bar, { width: "100%", duration: 1.6, ease: "power2.inOut" }, 0)
    .to(loader, {
      yPercent: -100,
      duration: 0.9,
      ease: "expo.inOut",
    })
    .set(loader, { display: "none" })
}

/* ------------------------------------------------------------------
   2. Hero intro
------------------------------------------------------------------ */
function introAnimation() {
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } })

  tl.from(".hero__title .word", {
    yPercent: 120,
    duration: 1.1,
    stagger: 0.08,
  })
    .from(
      ".hero__index, .hero__desc, .hero__scroll",
      { y: 24, opacity: 0, duration: 0.8, stagger: 0.1 },
      "-=0.6"
    )
    .from(
      ".header",
      { y: -40, opacity: 0, duration: 0.7 },
      "-=0.8"
    )

  buildScrollAnimations()
}

/* ------------------------------------------------------------------
   3. Scroll-driven animations
------------------------------------------------------------------ */
function buildScrollAnimations() {
  // Section headings + reveal blocks
  gsap.utils.toArray(".section-head__title").forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 88%" },
      yPercent: 100,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
    })
  })

  gsap.utils.toArray(".reveal").forEach((el, i) => {
    gsap.to(el, {
      scrollTrigger: { trigger: el, start: "top 90%" },
      y: 0,
      opacity: 1,
      duration: 1,
      delay: (i % 3) * 0.08,
      ease: "expo.out",
    })
  })

  // Work list rows
  gsap.from(".work__item", {
    scrollTrigger: { trigger: ".work__list", start: "top 80%" },
    y: 30,
    opacity: 0,
    duration: 0.7,
    stagger: 0.07,
    ease: "power3.out",
  })

  // Marquee scroll velocity skew
  setupMarquee()

  // Stats counters
  setupCounters()
}

/* ------------------------------------------------------------------
   4. Infinite marquee (loops, reacts to scroll direction)
------------------------------------------------------------------ */
function setupMarquee() {
  const track = document.getElementById("marquee")
  if (!track) return

  const half = track.scrollWidth / 2
  const loop = gsap.to(track, {
    x: -half,
    duration: 18,
    ease: "none",
    repeat: -1,
  })

  let direction = 1
  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const dir = self.direction
      if (dir !== direction) {
        direction = dir
        gsap.to(loop, { timeScale: dir, duration: 0.4, overwrite: true })
      }
    },
  })
}

/* ------------------------------------------------------------------
   5. Animated stat counters
------------------------------------------------------------------ */
function setupCounters() {
  gsap.utils.toArray(".stat__num").forEach((el) => {
    const target = Number(el.dataset.count)
    const obj = { value: 0 }
    gsap.to(obj, {
      value: target,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => {
        el.textContent = String(Math.round(obj.value)).padStart(2, "0")
      },
    })
  })
}

/* ------------------------------------------------------------------
   6. Floating preview for work list
------------------------------------------------------------------ */
function setupWorkPreview() {
  const preview = document.getElementById("workPreview")
  const items = gsap.utils.toArray(".work__item")
  if (!preview || window.matchMedia("(max-width: 900px)").matches) return

  const inner = document.createElement("div")
  inner.className = "work__preview-inner"
  preview.appendChild(inner)

  const xTo = gsap.quickTo(preview, "x", { duration: 0.5, ease: "power3" })
  const yTo = gsap.quickTo(preview, "y", { duration: 0.5, ease: "power3" })

  window.addEventListener("mousemove", (e) => {
    xTo(e.clientX)
    yTo(e.clientY)
  })

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      inner.textContent = item.dataset.img
      gsap.to(preview, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" })
    })
    item.addEventListener("mouseleave", () => {
      gsap.to(preview, { opacity: 0, scale: 0.85, duration: 0.3, ease: "power3.out" })
    })
  })
}

/* ------------------------------------------------------------------
   7. Smooth anchor scroll
------------------------------------------------------------------ */
function setupAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href")
      const target = id === "#top" ? document.body : document.querySelector(id)
      if (!target) return
      e.preventDefault()
      const top = id === "#top" ? 0 : target.getBoundingClientRect().top + window.scrollY - 20
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" })
    })
  })
}

/* ------------------------------------------------------------------
   8. Grid overlay toggle (press "G")
------------------------------------------------------------------ */
function setupGridToggle() {
  const overlay = document.getElementById("gridOverlay")
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "g") overlay.classList.toggle("is-visible")
  })
}

/* ------------------------------------------------------------------
   Init
------------------------------------------------------------------ */
window.addEventListener("DOMContentLoaded", () => {
  runLoader()
  setupWorkPreview()
  setupAnchors()
  setupGridToggle()
})
