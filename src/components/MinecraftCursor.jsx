import { useEffect } from "react";
import "./MinecraftCursor.css";

/**
 * Minecraft-style custom cursor using the exact pickaxe and Creeper
 * artwork extracted from the supplied reference image.
 *
 * Mount this component once, near the root of your React application.
 */
export default function MinecraftCursor() {
  useEffect(() => {
    // Custom cursor is only enabled for devices with a precise pointer.
    const mediaQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    if (!mediaQuery.matches) return undefined;

    const cursor = document.querySelector(".minecraft-cursor");
    if (!cursor) return undefined;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let lastX = mouseX;
    let lastY = mouseY;
    let animationFrameId;

    const colors = [
      "#ffb45e",
      "#ffd18a",
      "#f28c45",
      "#e9a65b",
      "#ffffff",
    ];

    function createPixel(x, y) {
      const pixel = document.createElement("div");
      pixel.className = "pixel-particle";

      const size = Math.random() * 5 + 3;
      const moveX = (Math.random() - 0.5) * 45;
      const moveY = (Math.random() - 0.5) * 45;

      pixel.style.width = size + "px";
      pixel.style.height = size + "px";
      pixel.style.left = x + "px";
      pixel.style.top = y + "px";
      pixel.style.background =
        colors[Math.floor(Math.random() * colors.length)];

      pixel.style.setProperty("--move-x", moveX + "px");
      pixel.style.setProperty("--move-y", moveY + "px");

      document.body.appendChild(pixel);

      const cleanup = () => {
        if (pixel.parentNode) {
          pixel.remove();
        }
      };

      pixel.addEventListener("animationend", cleanup, { once: true });
      setTimeout(cleanup, 800);
    }

    const handleMouseMove = (event) => {
      const x = event.clientX;
      const y = event.clientY;

      mouseX = x;
      mouseY = y;

      const distance = Math.hypot(x - lastX, y - lastY);

      // Generate pixels based on mouse movement
      if (distance > 4) {
        createPixel(
          lastX + (x - lastX) * 0.3,
          lastY + (y - lastY) * 0.3
        );

        createPixel(
          lastX + (x - lastX) * 0.7,
          lastY + (y - lastY) * 0.7
        );
      }

      lastX = x;
      lastY = y;

      const hoveredElement = event.target.closest(
        [
          "a",
          "button",
          "input",
          "textarea",
          "select",
          "label",
          "[role='button']",
          "[data-cursor='hover']",
          ".hover-target",
        ].join(",")
      );

      cursor.classList.toggle("hovering", Boolean(hoveredElement));
    };

    const handleMouseLeave = () => {
      cursor.classList.add("cursor-hidden");
    };

    const handleMouseEnter = () => {
      cursor.classList.remove("cursor-hidden");
    };

    const animate = () => {
      // Smooth, slightly eased movement.
      currentX += (mouseX - currentX) * 0.2;
      currentY += (mouseY - currentY) * 0.2;

      cursor.style.transform = `translate3d(${currentX - 26}px, ${
        currentY - 30
      }px, 0)`;

      animationFrameId = window.requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    animate();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.cancelAnimationFrame(animationFrameId);
      document.querySelectorAll(".pixel-particle").forEach((p) => p.remove());
    };
  }, []);

  return (
    <div className="minecraft-cursor" aria-hidden="true">
      <img
        className="minecraft-cursor__image minecraft-cursor__pickaxe"
        src="/images/pickaxe_cursor.png"
        alt=""
        draggable="false"
      />
      <img
        className="minecraft-cursor__image minecraft-cursor__hand"
        src="/images/hand_cursor.png"
        alt=""
        draggable="false"
      />
    </div>
  );
}
