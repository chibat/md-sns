import React from 'react'
import { useEffect, useContext, useState } from 'react'
import marked from 'marked';
import hljs from 'https://esm.sh/highlight.js@11.3.1';
import { UserContext } from '~/lib/UserContext.ts'
import { request } from '~/lib/request.ts'
import LikeUsersModal from '~/components/like_users_modal.tsx'

import type { RequestType as DeleteRequest, ResponseType as DeleteResponse } from "~/api/delete_post.ts";
import type { RequestType as LikeRequest, ResponseType as LikeResponse } from "~/api/create_like.ts";
import type { RequestType as CancelLikeRequest, ResponseType as CancelLikeResponse } from "~/api/delete_like.ts";
import type { ResponsePost } from "~/lib/types.ts";
import type { ResponseType } from "~/api/get_posts.ts";

type Props = {
  posts: ResponseType;
  setPosts: React.Dispatch<React.SetStateAction<ResponsePost[]>>;
}

export default function Posts(props: Props) {

  const [requesting, setRequesting] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<number>();

  useEffect(() => {
    console.debug("useEffect");
    hljs.highlightAll();
  });

  async function deletePost(postId: number) {
    if (confirm("Delete the post?")) {
      await request<DeleteRequest, DeleteResponse>("delete_post", { postId });
      location.href = "/";
    }
  }

  async function like(post: ResponsePost) {
    setRequesting(true);
    await request<LikeRequest, LikeResponse>("create_like", { postId: post.id });
    post.liked = true;
    post.likes = "" + (Number(post.likes) + 1);
    props.setPosts([...props.posts]);
    setRequesting(false);
  }

  async function cancelLike(post: ResponsePost) {
    setRequesting(true);
    await request<CancelLikeRequest, CancelLikeResponse>("delete_like", { postId: post.id });
    post.liked = false;
    post.likes = "" + (Number(post.likes) - 1);
    props.setPosts([...props.posts]);
    setRequesting(false);
  }

  function openModal(postId: number) {
    setSelectedPostId(postId);
    setModal(true);
  }

  const user = useContext(UserContext);
  console.debug("start ");

  return (
    <>
      <head>
        <title>md-sns</title>
      </head>
      {props.posts && props.posts.map(post =>
        <div className="card mb-3" key={post.id}>
          <div className="card-header bg-transparent d-flex justify-content-between">
            <div>
              <img src={post.picture} alt="mdo" width="32" height="32" className="rounded-circle" />
              <a href={`/users/${post.user_id}`} className="ms-2 noDecoration">{post.name}</a>
              <a href={`/posts/${post.id}`} className="ms-2 noDecoration">{new Date(post.updated_at).toLocaleString()}</a>
            </div>
            {user && user.userId === post.user_id &&
              <div>
                <a href={`/posts/${post.id}/edit`}><img src="/assets/img/pencil-fill.svg" alt="Edit" width="20" height="20"></img></a>
                <a href={void (0)} className="ms-2" onClick={() => deletePost(post.id)}><img src="/assets/img/trash-fill.svg" alt="Delete" width="20" height="20"></img></a>
              </div>
            }
          </div>
          <div className="card-body">
            <span dangerouslySetInnerHTML={{ __html: marked(post.source) }}></span>
          </div>
          {(user || Number(post.comments) > 0 || Number(post.likes) > 0) &&
            <div className="card-footer bg-transparent">
              {user &&
                <a className="btn btn-outline-secondary btn-sm" href={`/posts/${post.id}`}>Comment</a>
              }
              {Number(post.comments) > 0 &&
                <a className="ms-2 noDecoration" href={`/posts/${post.id}`}>{post.comments} Comment{post.comments === "1" ? "" : "s"}</a>
              }
              {requesting &&
                <div className="spinner-grow spinner-grow-sm ms-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              }
              {user && !requesting && post.liked &&
                <a href={void (0)} onClick={() => cancelLike(post)} className="ms-3"><img src="/assets/img/heart-fill.svg" alt="Edit" width="20" height="20"></img></a>
              }
              {user && !requesting && !post.liked &&
                <a href={void (0)} onClick={() => like(post)} className="ms-3"><img src="/assets/img/heart.svg" alt="Edit" width="20" height="20"></img></a>
              }
              {Number(post.likes) > 0 &&
                <a href={void (0)} className="noDecoration ms-2" onClick={() => openModal(post.id)}>{post.likes} Like{post.likes === "1" ? "" : "s"}</a>
              }
            </div>
          }
        </div>
      )}
      {modal && selectedPostId &&
        <LikeUsersModal postId={selectedPostId} modal={modal} setModal={setModal} />
      }
    </>
  );
}
