import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="font-display text-[8rem] leading-none font-bold text-marigold italic">404</p>
    <h1 className="font-display mt-2 text-3xl font-semibold">This aisle doesn't exist.</h1>
    <p className="mt-2 text-ink-soft">The page you are looking for was moved or never existed.</p>
    <Link to="/home" className="btn btn-primary mt-6">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
