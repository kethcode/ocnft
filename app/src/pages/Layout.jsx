import { Outlet, Link } from "react-router-dom";
import "./styles.css";

const Layout = () => {
  return (
    <>
      <nav>
        <div className="nav-container">
          <div className="nav">Composable NFT Demo</div>
          <ul>
            <li className="nav li">
              <Link to="/">Home</Link>
            </li>
            <li className="nav li">
              <Link to="/top">Top</Link>
            </li>
            <li className="nav li">
              <Link to="/avatar">Avatar</Link>
            </li>
            <li className="nav li">
              <Link to="/builder">Builder</Link>
            </li>
          </ul>
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Layout;
