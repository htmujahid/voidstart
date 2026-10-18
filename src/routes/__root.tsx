import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import "../styles.css"

export const Route = createRootRoute({
  component: () => (
    <>
      <nav>
        <Link to="/">Home</Link> <Link to="/about">About</Link>
      </nav>
      <Outlet />
    </>
  ),
});
