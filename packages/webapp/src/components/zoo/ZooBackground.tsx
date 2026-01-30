/**
 * Layered background for the Zoo stage.
 * Creates depth with sky gradient, distant hills, and ground layers.
 */
export function ZooBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #8DBC6C 0%, #7AA65B 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.22) 0 2px, transparent 3px), radial-gradient(circle at 70% 10%, rgba(255, 255, 255, 0.18) 0 2px, transparent 3px)",
          backgroundSize: "90px 90px, 140px 140px",
          backgroundPosition: "0 0, 30px 40px",
        }}
      />
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 70%, rgba(0, 0, 0, 0.12) 0 2px, transparent 3px), radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.1) 0 2px, transparent 3px)",
          backgroundSize: "120px 120px, 160px 160px",
          backgroundPosition: "10px 20px, 60px 80px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          boxShadow: "inset 0 0 140px rgba(0, 0, 0, 0.12)",
        }}
      />
    </div>
  );
}
