import React, { ComponentType } from "react";
import { AuthInfo } from "~/lib/auth.ts";
import { useState, useEffect } from 'react';
import { useRouter } from 'aleph/react'
import { UserContext } from '~/lib/UserContext.ts';
import { request } from '~/lib/request.ts'
import 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css';
import "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.0/styles/tomorrow-night.min.css";
import marked from 'marked';
import "./style/app.css";

import type { ResponseType } from "~/api/auth_info.ts";

marked.setOptions({ breaks: true });

export default function App(
  { Page, pageProps }: { Page: ComponentType<any>; pageProps: any },
) {
  console.debug("start");
  const router = useRouter();

  const [authInfo, setAuthInfo] = useState<AuthInfo>();
  const [notification, setNotification] = useState<boolean>();

  function signin() {
    if (authInfo && authInfo.authUrl) {
      location.href = authInfo.authUrl;
    }
  }

  function signout() {
    location.href = "/api/signout";
  }

  function goTop() {
    //if (new URL(location.href).pathname === "/") {
    //  location.href = "/";
    //} else {
    //  router.push("/");
    //}
    location.href = "/";
  }

  function goNotification() {
    router.push("/notification");
    setNotification(false);
  }

  useEffect(() => {
    (async () => {
      const json = await request<void, ResponseType>("auth_info");
      setAuthInfo(json);
      if (json.loginUser) {
        setNotification(json.loginUser.notification);
      }
      console.debug("useEffect", json);
    })();
  }, []);

  return (
    <>
      <head>
        <meta name="viewport" content="width=device-width" />
      </head>
      <div className="page">
        <header className="py-3 mb-3 border-bottom bg-white">
          <div className="container-fluid d-grid gap-3 align-items-center" style={{ gridTemplateColumns: "1fr 2fr" }}>
            <div>
              <img src="/assets/img/icon-192x192.png" width="32" className="me-2" />
              <a className="fs-4 me-3 noDecoration" href={void (0)} onClick={goTop}>md-sns</a>
              <a className="me-3 noDecoration" href="/">All</a>
              {authInfo && authInfo.loginUser &&
                <a className="me-3 noDecoration" href="/following">Following</a>
              }
            </div>
            <div className="d-flex align-items-center ms-auto">
              <a className="me-3 noDecoration" href="/about">About</a>
              {authInfo && authInfo.loginUser &&
                <>
                  <a href="/notification" onClick={goNotification}>
                    {!notification &&
                      <img alt="bell" src="/assets/img/bell.png" width="20px" className="me-3" />
                    }
                    {notification &&
                      <img alt="bell" src="/assets/img/bell2.png" width="20px" className="me-3" />
                    }
                  </a>
                  <div className="flex-shrink-0 dropdown">
                    <a href={void (0)} className="d-block link-dark text-decoration-none dropdown-toggle" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false">
                      <img src={authInfo.loginUser.picture} alt="mdo" width="32" height="32" className="rounded-circle" />
                    </a>
                    <ul className="dropdown-menu text-small shadow" aria-labelledby="dropdownUser2">
                      <li><a className="dropdown-item" href={`/users/${authInfo.loginUser.userId}`}>Profile</a></li>
                      <li><a className="dropdown-item" href="/likes">Likes</a></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><a className="dropdown-item" href={void (0)} onClick={signout}>Sign out</a></li>
                    </ul>
                  </div>
                </>
              }
            </div>
          </div>
        </header>
        <main className="container">
          {authInfo && authInfo.authUrl &&
            <>
              <div style={{ textAlign: "center" }}>
                <input type="image" src="/assets/img/btn_google_signin_dark_pressed_web.png" onClick={signin} />
              </div>
              <div className="mb-3" style={{ textAlign: "center" }}>
                You will be able to post when you Sign-in.
              </div>
            </>
          }
          <UserContext.Provider value={authInfo?.loginUser}>
            <Page {...pageProps} />
          </UserContext.Provider>
        </main>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-/bQdsTh/da6pkI1MST/rWKFNjaCP5gBSY4sEBT38Q/9RBh9AH40zEOg7Hlq2THRZ" crossOrigin="anonymous"></script>
    </>
  );
}
