import React from 'react'
import { useContext, useState, useEffect } from 'react'
import { useRouter } from 'aleph/react'
import { UserContext } from '~/lib/UserContext.ts'
import Posts from '~/components/posts.tsx'
import { request } from '~/lib/request.ts';
import { Post } from '~/lib/db.ts';
import type { RequestType, ResponseType } from "~/api/get_posts.ts";
import type { RequestType as UserRequest, ResponseType as UserResponse } from "~/api/get_user.ts";

export default function User() {
  const router = useRouter();
  const userId = Number(router.params.userId);

  const user = useContext(UserContext);
  console.debug("start ", userId);

  const [posts, setPosts] = useState<Array<Post>>([]);
  const [previousButton, setPreviousButton] = useState<boolean>(false);
  const [nextButton, setNextButton] = useState<boolean>(true);
  const [appUser, setAppUser] = useState<UserResponse>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await request<UserRequest, UserResponse>("get_user", { userId });
      setAppUser(result);
      const results = await request<RequestType, ResponseType>("get_posts", { userId });
      setPosts(results);
      if (results.length < 3) {
        setPreviousButton(false);
        setNextButton(false);
      }
      setLoading(false);
    })();
  }, []);

  async function previous() {
    setLoading(true);
    const postId = posts[0].id;
    const results = await request<RequestType, ResponseType>("get_posts", { postId, userId, direction: "previous" });
    if (results.length > 0) {
      setPosts(results);
      setNextButton(true);
    }

    if (results.length < 3) {
      setPreviousButton(false);
    }
    setLoading(false);
  }

  async function next() {
    setLoading(true);
    const postId = posts[posts.length - 1].id;
    const results = await request<RequestType, ResponseType>("get_posts", { postId, userId, direction: "next" });
    if (results.length > 0) {
      setPosts(results);
      setPreviousButton(true);
    }

    if (results.length < 3) {
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
          <h1>{appUser?.name}</h1>
          <Posts posts={posts} />
          {previousButton && <button className="btn btn-secondary me-2" onClick={previous} style={{width: "150px"}}>Previous</button>}
          {nextButton && <button className="btn btn-secondary" onClick={next} style={{width: "150px"}}>Next</button>}
          <br />
        </>
      }
    </>
  );
}
