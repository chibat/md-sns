import React from 'react'

export default function About() {

  return (
    <>
      <head>
        <title>About - md-sns</title>
      </head>
      <h1>About this site</h1>
      <ul>
        <li>This site is a demo site by <a href="https://github.com/chibat" target="_blank" className="doc">@chibat</a>.</li>
        <li>I created something like SNS that can be posted with Markdown.</li>
        <li>This site runs on Heroku free tier.</li>
        <li>It is created using the following:
          <ul>
            <li>Deno</li>
            <li>TypeScript</li>
            <li>Aleph.js</li>
            <li>React</li>
            <li>Heroku</li>
            <li>PostgreSQL</li>
            <li>Marked</li>
            <li>highlight.js</li>
            <li><a href="https://github.com/chibat/heroku-buildpack-deno" target="_blank" className="doc">heroku-buildpack-deno</a></li>
          </ul>
        </li>
        <li><a href="https://github.com/chibat/md-sns" target="_blank" className="doc">source code</a></li>
      </ul>
      <h2>Japanese</h2>
      <ul>
        <li>このサイトは、<a href="https://github.com/chibat" target="_blank" className="doc">@chibat</a> による デモサイトです。</li>
        <li>Markdown で投稿できる SNS っぽいものを作成してみました。</li>
        <li>Heroku の無料枠で動かしています。</li>
        <li>次のものを利用し作成しています。
          <ul>
            <li>Deno</li>
            <li>TypeScript</li>
            <li>Aleph.js</li>
            <li>React</li>
            <li>Heroku</li>
            <li>PostgreSQL</li>
            <li>Marked</li>
            <li>highlight.js</li>
            <li><a href="https://github.com/chibat/heroku-buildpack-deno" target="_blank" className="doc">heroku-buildpack-deno</a></li>
          </ul>
        </li>
        <li><a href="https://github.com/chibat/md-sns" target="_blank" className="doc">ソースコード</a></li>
      </ul>
    </>
  );
}

