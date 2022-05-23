import { Outlet, Link } from "react-router-dom";
import "./styles.css";

const Layout = () => {
  return (
    <div class="app-container">
      <nav className="header__container">
        <nav className="desktop-header__container">
          <section>
            <Link class="desktop-header__header-link" to="/">Composable NFT Demo</Link>
          
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/top">Top</Link></li>
            <li><Link to="/avatar">Avatar</Link></li>
            <li><Link to="/builder">Builder</Link></li>

          </ul>
          </section>
          <section>
          </section>
        </nav>
      </nav>

      <Outlet />
    </div>
  );
};

export default Layout;
