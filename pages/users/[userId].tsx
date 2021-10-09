import React from 'react'
import { useContext, useState, useEffect } from 'react'
import { useRouter } from 'aleph/react'
import { UserContext } from '~/lib/UserContext.ts'
import Posts from '~/components/posts.tsx'
import { request } from '~/lib/request.ts';
import { Post, AppUser } from '~/lib/db.ts';
import { PAGE_ROWS } from '~/lib/constants.ts';
import type { RequestType, ResponseType } from "~/api/get_posts.ts";
import type { RequestType as UserRequest, ResponseType as UserResponse } from "~/api/get_user.ts";
import type { RequestType as FollowRequest, ResponseType as FollowResponse } from "~/api/create_follow.ts";
import type { RequestType as UnfollowRequest, ResponseType as UnfollowResponse } from "~/api/delete_follow.ts";

export default function User() {
  const router = useRouter();
  const userId = Number(router.params.userId);

  const loginUser = useContext(UserContext);
  console.debug("start ", userId);

  const [posts, setPosts] = useState<Array<Post>>([]);
  const [previousButton, setPreviousButton] = useState<boolean>(false);
  const [nextButton, setNextButton] = useState<boolean>(false);
  const [pageUser, setPageUser] = useState<AppUser | null>();
  const [loading, setLoading] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [following, setFollowing] = useState<string>('0');
  const [followers, setFollowers] = useState<string>('0');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await request<UserRequest, UserResponse>("get_user", { userId });
      setPageUser(result.user);
      setFollowing(result.following);
      setFollowers(result.followers);
      setIsFollowing(result.isFollowing);
      const results = await request<RequestType, ResponseType>("get_posts", { userId });
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
    const results = await request<RequestType, ResponseType>("get_posts", { postId, userId, direction: "previous" });
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
    const results = await request<RequestType, ResponseType>("get_posts", { postId, userId, direction: "next" });
    if (results.length > 0) {
      setPosts(results);
      setPreviousButton(true);
    }

    if (results.length < PAGE_ROWS) {
      setNextButton(false);
    }
    setLoading(false);
  }

  async function follow() {
    if (pageUser) {
      setFollowLoading(true);
      await request<FollowRequest, FollowResponse>("create_follow", { followingId: pageUser.id });
      setFollowers((Number(following) + 1).toString());
      setIsFollowing(!isFollowing);
      setFollowLoading(false);
    }
  }

  async function unfollow() {
    if (pageUser) {
      setFollowLoading(true);
      await request<UnfollowRequest, UnfollowResponse>("delete_follow", { userId: pageUser.id, });
      const _following = Number(following) - 1;
      setFollowers((_following < 0 ? 0 : _following).toString());
      setIsFollowing(!isFollowing);
      setFollowLoading(false);
    }
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
          <h1>{pageUser?.name}</h1>
          {(loginUser && pageUser && pageUser.id !== loginUser.appId) &&
            <>
              {!isFollowing &&
                <button className="btn btn-secondary me-2 mb-2" onClick={follow} style={{ width: "150px" }} disabled={followLoading}>
                  {followLoading &&
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  }
                  Follow
                </button>
              }
              {isFollowing &&
                <>
                  Following
                  <button className="btn btn-danger ms-2 me-2 mb-2" onClick={unfollow} style={{ width: "150px" }} disabled={followLoading}>
                    {followLoading &&
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    }
                    Unfollow
                  </button>
                </>
              }
            </>
          }
          <div className="mb-3">
            <a href="#" className="noDecoration me-3">{following} Following</a>
            <a href="#" className="noDecoration">{followers} Followers</a>
          </div>
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
