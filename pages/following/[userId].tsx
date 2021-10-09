import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'aleph/react'
import Posts from '~/components/posts.tsx'
import { request } from '~/lib/request.ts';
import { Post } from '~/lib/db.ts';
import { PAGE_ROWS } from '~/lib/constants.ts';
import type { RequestType, ResponseType } from "~/api/get_posts.ts";

export default function User() {
  const router = useRouter();
  const userId = Number(router.params.userId);

  console.debug("start ", userId);

  const [posts, setPosts] = useState<Array<Post>>([]);
  const [previousButton, setPreviousButton] = useState<boolean>(false);
  const [nextButton, setNextButton] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const results = await request<RequestType, ResponseType>("get_posts", { userId, followig: true });
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
    const results = await request<RequestType, ResponseType>("get_posts", { postId, userId, direction: "previous", followig: true });
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
    const results = await request<RequestType, ResponseType>("get_posts", { postId, userId, direction: "next", followig: true });
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
          <h1>Following</h1>
          <Posts posts={posts} />
          {previousButton && <button className="btn btn-secondary me-2" onClick={previous} style={{ width: "150px" }}>Previous</button>}
          {nextButton && <button className="btn btn-secondary" onClick={next} style={{ width: "150px" }}>Next</button>}
          <br />
          <br />
        </>
      }
    </>
  );
}
