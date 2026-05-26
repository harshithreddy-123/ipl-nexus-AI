import { useEffect } from "react";

function isTouch() {
  return typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
}

export default function CustomCursor() {
  useEffect(() => {
    if (isTouch()) return;

    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    document.body.appendChild(cursor);

    let raf = null;

    function updatePos(x, y) {
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) scale(var(--cursor-scale))`;
    }

    function onMove(e) {
      const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => updatePos(x, y));
    }

    function onDown() {
      cursor.classList.add("cursor-press");
      setTimeout(() => cursor.classList.remove("cursor-press"), 220);
    }

    function onOver(e) {
      const target = e.target;
      if (!target) return;
      const clickable = target.closest && (target.closest("button, a, [role=button], .btn-primary, .nav-link") !== null);
      if (clickable) cursor.classList.add("cursor-clickable");
      // special: bat style for primary buttons
      if (target.closest && target.closest(".btn-primary")) {
        cursor.classList.add("cursor-bat");
      }
    }

    function onOut() {
      cursor.classList.remove("cursor-clickable", "cursor-bat");
    }

    function onDocClick(e) {
      const btn = e.target.closest && e.target.closest(".btn-primary");
      if (btn) {
        const ripple = document.createElement("span");
        ripple.className = "btn-ripple";
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    document.addEventListener("click", onDocClick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      document.removeEventListener("click", onDocClick);
      if (raf) cancelAnimationFrame(raf);
      cursor.remove();
    };
  }, []);

  return null;
}
