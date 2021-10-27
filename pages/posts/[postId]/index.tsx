import React from 'react'
import { useEffect, useContext, useState } from 'react'
import hljs from 'https://esm.sh/highlight.js';
import marked from 'https://esm.sh/marked@2.0.1';
import { UserContext } from '~/lib/UserContext.ts'
import { useRouter, useDeno } from 'aleph/react'
import { request } from '~/lib/request.ts'
import { selectPost, Post } from "~/lib/db.ts";
import LikeUsersModal from '~/components/like_users_modal.tsx'
import type { RequestType as DeleteRequest, ResponseType as DeleteResponse } from "~/api/delete_post.ts";
import type { RequestType as CreateRequest, ResponseType as CreateResponse } from "~/api/create_comment.ts";
import type { RequestType as CommentsRequest, ResponseType as CommentsResponse } from "~/api/get_comments.ts";
import type { RequestType as DeleteCommentRequest, ResponseType as DeleteCommentResponse } from "~/api/delete_comment.ts";
import type { RequestType as LikeRequest, ResponseType as LikeResponse } from "~/api/create_like.ts";
import type { RequestType as CancelLikeRequest, ResponseType as CancelLikeResponse } from "~/api/delete_like.ts";
import type { RequestType as IsLikedRequest } from "~/api/is_liked.ts";

export default function Index() {

  const router = useRouter();
  const postId = Number(router.params.postId);

  const user = useContext(UserContext);
  console.debug("start ", user, postId);

  const [flag, setFlag] = useState<boolean>(true);
  const [source, setSource] = useState<string>("");
  const [likes, setLikes] = useState<string>('0');
  const [liked, setLiked] = useState<boolean>();
  const [comments, setComments] = useState<CommentsResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [requesting, setRequesting] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const post = useDeno(async () => {
    return await selectPost(postId);
  }, { revalidate: true });

  function displayEdit() {
    setFlag(true);
  }

  function displayPreview() {
    setFlag(false);
  }

  async function deletePost() {
    if (confirm("Delete the post?")) {
      await request<DeleteRequest, DeleteResponse>("delete_post", { postId });
      router.push("/");
    }
  }

  async function deleteComment(commentId: number) {
    if (confirm("Delete the comment?")) {
      await request<DeleteCommentRequest, DeleteCommentResponse>("delete_comment", { commentId });
      await readComments();
    }
  }

  async function readComments() {
    const results = await request<CommentsRequest, CommentsResponse>("get_comments", { postId });
    setComments(results);
  }

  async function reply() {
    setLoading(true);
    await request<CreateRequest, CreateResponse>("create_comment", { postId, source: source });
    await readComments();
    setSource("");
    setLoading(false);
  }

  async function like(post: Post) {
    setRequesting(true);
    await request<LikeRequest, LikeResponse>("create_like", { postId: post.id });
    setLiked(true);
    setLikes("" + (Number(likes) + 1));
    setRequesting(false);
  }

  async function cancelLike(post: Post) {
    setRequesting(true);
    await request<CancelLikeRequest, CancelLikeResponse>("delete_like", { postId: post.id });
    setLiked(false);
    setLikes("" + (Number(likes) - 1));
    setRequesting(false);
  }

  async function openModal() {
    setModal(true);
  }

  useEffect(() => {
    console.debug("useEffect");
    if (!post) {
      router.push("/");
      return;
    }
    setLikes(post.likes);
    (async () => {
      const _liked = await request<IsLikedRequest, boolean>("is_liked", { postId });
      console.log(_liked);
      setLiked(_liked);
      await readComments();
    })();
  }, []);

  useEffect(() => {
    console.debug("useEffect");
    hljs.highlightAll();
  });

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setSource(event.target.value);
  };

  return (
    <>
      {post &&
        <>
          <head>
            <title>Post {post.id} - md-sns</title>
            <meta property="og:url" content="https://md-sns.herokuapp.com/"></meta>
            <meta property="og:title" content={`md-sns: Post ${post.id}`}></meta>
            <meta property="og:description" content={post.source?.substring(0,1000)?.replaceAll("\n", " ")}></meta>
            <meta property="og:image" content={post.picture} />
            <meta name="twitter:card" content="summary"></meta>
            <meta name="twitter:site" content="@tomofummy" />
          </head>
          <div className="card mb-3">
            <div className="card-header bg-transparent d-flex justify-content-between">
              <div>
                <img src={post.picture} alt="mdo" width="32" height="32" className="rounded-circle" />
                <a href={`/users/${post.user_id}`} className="ms-2 me-2 noDecoration">{post.name}</a>
                {new Date(post.updated_at).toLocaleString()}
              </div>
              {user?.userId === post.user_id &&
                <div>
                  <a href={`/posts/${post.id}/edit`}><img src="/assets/img/pencil-fill.svg" alt="Edit" width="20" height="20"></img></a>
                  <a href="#" className="ms-2" onClick={deletePost}><img src="/assets/img/trash-fill.svg" alt="Delete" width="20" height="20"></img></a>
                </div>
              }
            </div>
            <div className="card-body">
              <span dangerouslySetInnerHTML={{ __html: marked(post.source) }}></span>
            </div>
            <div className="card-footer bg-transparent">
              <div className="mb-3">
                {user && !requesting && liked &&
                  <a href={void (0)} onClick={() => cancelLike(post)} className="ms-3"><img src="/assets/img/heart-fill.svg" alt="Edit" width="20" height="20"></img></a>
                }
                {user && !requesting && !liked &&
                  <a href={void (0)} onClick={() => like(post)} className="ms-3"><img src="/assets/img/heart.svg" alt="Edit" width="20" height="20"></img></a>
                }
                {Number(likes) > 0 &&
                  <a href={void (0)} className="noDecoration ms-2" onClick={openModal}>{likes} Like{likes === "1" ? "" : "s"}</a>
                }
              </div>
              {comments && comments.map(comment =>
                <div className="border-bottom ms-4">
                  <div className="d-flex justify-content-between">
                    <div>
                      <img src={comment.picture} alt="mdo" width="32" height="32" className="rounded-circle" />
                      <a href={`/users/${comment.user_id}`} className="ms-2 me-2 noDecoration">{comment.name}</a>
                      {new Date(comment.updated_at).toLocaleString()}
                    </div>
                    {user?.userId === comment.user_id &&
                      <a href="#" className="ms-2" onClick={() => deleteComment(comment.id)}><img src="/assets/img/trash-fill.svg" alt="Delete" width="20" height="20"></img></a>
                    }
                  </div>
                  <div>
                    <span dangerouslySetInnerHTML={{ __html: marked(comment.source) }}></span>
                  </div>
                </div>
              )}
              {user &&
                <div className="ms-4 mt-2">
                  <div className="">
                    <ul className="nav nav-tabs">
                      <li className="nav-item">
                        <a className={flag ? "nav-link active" : "nav-link"} onClick={displayEdit}>Edit</a>
                      </li>
                      <li className="nav-item">
                        <a className={!flag ? "nav-link active" : "nav-link"} onClick={displayPreview}>Preview</a>
                      </li>
                    </ul>
                    {flag &&
                      <textarea className="form-control mt-3" style={{ height: "250px" }} maxLength={5000} value={source} onChange={handleChange} placeholder="Write a comment with markdown">
                      </textarea>
                    }
                    {!flag &&
                      <span dangerouslySetInnerHTML={{ __html: marked(source) }}></span>
                    }
                  </div>
                  <div className="mt-2">
                    <button className="btn btn-primary" onClick={reply} disabled={loading || source.length === 0}>
                      {loading &&
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      }
                      Reply
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
          {modal &&
            <LikeUsersModal postId={postId} modal={modal} setModal={setModal} />
          }
        </>
      }
    </>
  );
}

