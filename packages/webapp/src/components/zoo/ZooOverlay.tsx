/**
 * Overlay effects for the Zoo stage.
 * Vignette and subtle lighting.
 */
export function ZooOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(74, 55, 40, 0.08) 70%, rgba(74, 55, 40, 0.15) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 15% 10%, rgba(255, 248, 230, 0.25) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
