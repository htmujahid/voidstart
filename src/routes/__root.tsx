import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

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
