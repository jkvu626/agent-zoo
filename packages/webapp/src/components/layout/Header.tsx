import { Link } from "react-router-dom";

import logo from "../../assets/logo.png";

export function Header() {
  return (
    <header
      className="border-b border-border px-panel py-5 shadow-sm"
      style={{ backgroundColor: "var(--accent-orange-muted)" }}
    >
      <h1>
        <Link
          to="/"
          className="inline-flex items-center gap-3 font-display text-4xl font-bold text-text-primary transition-transform duration-300 ease-out hover:scale-110 px-2 py-1"
        >
          <img
            src={logo}
            alt=""
            className="h-14 w-14 shrink-0 object-contain"
            aria-hidden
          />
          AgentZoo
        </Link>
      </h1>
    </header>
  );
}
