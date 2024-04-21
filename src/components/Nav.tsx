import React from "react";
import { useKeycloak } from "@react-keycloak/web";

const Nav = () => {
  const { keycloak } = useKeycloak();

  return (
    <div className="container-fluid">
      <div className="row">
        <section className="w-100">
          <nav className="navbar navbar-expand-md navbar-dark bg-gray-200 text-blue-800 justify-content-between">
            <div className="container-fluid">
              <a
                className="navbar-brand font-weight-bold font-heading"
                href="#"
              >
                Collaboard
              </a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div
                className="collapse navbar-collapse mk-auto"
                id="navbarSupportedContent"
              >
                {/* <ul className="mx-auto navbar-nav ms-auto mb-2 mb-lg-0 font-semibold font-heading">
                  <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="/">
                      Home
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/secured">
                      Secured Page
                    </a>
                  </li>
                </ul> */}
                {!keycloak.authenticated ? (
                  <button
                    type="button"
                    className="btn btn-primary ms-auto"
                    onClick={() => keycloak.login()}
                  >
                    Login
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary ms-auto"
                    onClick={() => keycloak.logout()}
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </nav>
        </section>
      </div>
    </div>
  );
};

export default Nav;
