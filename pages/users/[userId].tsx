import React from 'react'
import { useContext, useState, useEffect } from 'react'
import { useRouter, useDeno } from 'aleph/react'
import { UserContext } from '~/lib/UserContext.ts'
import Posts from '~/components/posts.tsx'
import { request } from '~/lib/request.ts';
import { PAGE_ROWS } from '~/lib/constants.ts';
import FollowingUsersModal from '~/components/following_users_modal.tsx'
import FollowerUsersModal from '~/components/follower_users_modal.tsx'
import { ResponsePost } from "~/lib/types.ts";
import { selectUser } from "~/lib/db.ts";

import type { RequestType, ResponseType } from "~/api/get_posts.ts";
import type { RequestType as FollowInfoRequest, ResponseType as FollowInfoResponse } from "~/api/get_follow_info.ts";
import type { RequestType as FollowRequest, ResponseType as FollowResponse } from "~/api/create_follow.ts";
import type { RequestType as UnfollowRequest, ResponseType as UnfollowResponse } from "~/api/delete_follow.ts";

export default function UserId() {
  const router = useRouter();
  const userId = Number(router.params.userId);

  const loginUser = useContext(UserContext);
  console.debug("start ", userId);

  const [posts, setPosts] = useState<Array<ResponsePost>>([]);
  const [previousButton, setPreviousButton] = useState<boolean>(false);
  const [nextButton, setNextButton] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [following, setFollowing] = useState<string>('0');
  const [followers, setFollowers] = useState<string>('0');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followingModal, setFollowingModal] = useState<boolean>(false);
  const [followerModal, setFollowerModal] = useState<boolean>(false);

  const pageUser = useDeno(async () => {
    return await selectUser(userId);
  }, { revalidate: true });

  useEffect(() => {
    if (!pageUser) {
      router.push("/");
      return;
    }
    (async () => {
      setLoading(true);
      const result = await request<FollowInfoRequest, FollowInfoResponse>("get_follow_info", { userId });
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
      await request<FollowRequest, FollowResponse>("create_follow", { followingUserId: pageUser.id });
      setFollowers((Number(followers) + 1).toString());
      setIsFollowing(!isFollowing);
      setFollowLoading(false);
    }
  }

  async function unfollow() {
    if (pageUser) {
      setFollowLoading(true);
      await request<UnfollowRequest, UnfollowResponse>("delete_follow", { followingUserId: pageUser.id, });
      const _followers = Number(followers) - 1;
      setFollowers((_followers < 0 ? 0 : _followers).toString());
      setIsFollowing(!isFollowing);
      setFollowLoading(false);
    }
  }

  async function displayFollowingUsers() {
    setFollowingModal(true);
  }

  async function displayFollowerUsers() {
    setFollowerModal(true);
  }

  return (
    <>
      <head>
        <title>md-sns</title>
        <meta property="og:url" content="https://md-sns.herokuapp.com/"></meta>
        <meta property="og:title" content={`${pageUser?.name} - md-sns`}></meta>
        <meta property="og:description" content={pageUser?.name}></meta>
        <meta property="og:image" content={pageUser?.picture} />
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:image" content={pageUser?.picture} />
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
          <h1><img src={pageUser?.picture} className="img-thumbnail" alt="" /> {pageUser?.name}</h1>
          {(loginUser && pageUser && pageUser.id !== loginUser.userId) &&
            <>
              {!isFollowing &&
                <button className="btn btn-secondary me-2 mb-2" onClick={follow} style={{ width: "150px" }} disabled={followLoading}>
                  {followLoading &&
                    <div className="spinner-border spinner-border-sm me-2" role="status">
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
                      <div className="spinner-border spinner-border-sm me-2" role="status">
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
            <a className="noDecoration me-3" onClick={displayFollowingUsers}>{following} Following</a>
            <a className="noDecoration me-3" onClick={displayFollowerUsers}>{followers} Follower{followers === "1" ? "" : "s"}</a>
            {(loginUser && pageUser && pageUser.id === loginUser.userId) &&
              <a className="noDecoration" href="/likes">Likes</a>
            }
          </div>
          <Posts posts={posts} setPosts={setPosts} />
          {previousButton &&
            <button className="btn btn-secondary me-2" onClick={previous} style={{ width: "150px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left me-2" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
              </svg>
              Previous
            </button>
          }
          {nextButton &&
            <button className="btn btn-secondary" onClick={next} style={{ width: "150px" }}>
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right ms-2" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>}
          <br />
          <br />
        </>
      }
      {followingModal &&
        <FollowingUsersModal userId={userId} modal={followingModal} setModal={setFollowingModal} />
      }
      {followerModal &&
        <FollowerUsersModal userId={userId} modal={followerModal} setModal={setFollowerModal} />
      }
    </>
  );
}
