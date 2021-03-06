import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'aleph/react'
import Posts from '~/components/posts.tsx'
import { request } from '~/lib/request.ts';
import { PAGE_ROWS } from '~/lib/constants.ts';

import type { ResponsePost } from "~/lib/types.ts";
import type { RequestType, ResponseType } from "~/api/get_liked_posts.ts";

export default function User() {
  const router = useRouter();

  console.debug("start ");

  const [posts, setPosts] = useState<Array<ResponsePost>>([]);
  const [previousButton, setPreviousButton] = useState<boolean>(false);
  const [nextButton, setNextButton] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const results = await request<RequestType, ResponseType>("get_liked_posts", {});
      setPosts(results);
      if (results.length < PAGE_ROWS) {
        setPreviousButton(false);
        setNextButton(false);
      } else {
        setNextButton(true);
      }
      setLoading(false);
    })();
  }, []);

  async function previous() {
    setLoading(true);
    const postId = posts[0].id;
    const results = await request<RequestType, ResponseType>("get_liked_posts", { postId, direction: "previous" });
    if (results.length > 0) {
      setPosts(results);
      setNextButton(true);
    }

    if (results.length < PAGE_ROWS) {
      setPreviousButton(false);
    }
    setLoading(false);
  }

  async function next() {
    setLoading(true);
    const postId = posts[posts.length - 1].id;
    const results = await request<RequestType, ResponseType>("get_liked_posts", { postId, direction: "next" });
    if (results.length > 0) {
      setPosts(results);
      setPreviousButton(true);
    }

    if (results.length < PAGE_ROWS) {
      setNextButton(false);
    }
    setLoading(false);
  }

  return (
    <>
      <head>
        <title>md-sns</title>
      </head>
      {loading &&
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
      {!loading &&
        <>
          <h1>Likes</h1>
          <Posts posts={posts} setPosts={setPosts} />
          {previousButton && <button className="btn btn-secondary me-2" onClick={previous} style={{ width: "150px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left me-2" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
            </svg>
            Previous
          </button>}
          {nextButton && <button className="btn btn-secondary" onClick={next} style={{ width: "150px" }}>
            Next
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right ms-2" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>}
          <br />
          <br />
        </>
      }
    </>
  );
}
