import React from 'react'
import { useEffect, useContext } from 'react'
import marked from 'https://esm.sh/marked@2.0.1';
import hljs from 'https://esm.sh/highlight.js';
import { UserContext } from '~/lib/UserContext.ts'
import { request } from '~/lib/request.ts'
import type { Post } from '~/lib/db.ts';
import type { RequestType as DeleteRequest, ResponseType as DeleteResponse } from "~/api/delete_post.ts";

type Props = {
  posts: Post[];
}

export default function Posts(props: Props) {

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

  const user = useContext(UserContext);
  console.debug("start ", user);

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
              <a href={`/posts/${post.id}`} className="ms-2 noDecoration">{post.updated_at}</a>
            </div>
            {user && user.appId === post.user_id &&
              <div>
                <a href={`/posts/${post.id}/edit`}><img src="/assets/img/pencil-fill.svg" alt="Edit" width="20" height="20"></img></a>
                <a href="#" className="ms-2" onClick={() => deletePost(post.id)}><img src="/assets/img/trash-fill.svg" alt="Delete" width="20" height="20"></img></a>
              </div>
            }
          </div>
          <div className="card-body">
            <span dangerouslySetInnerHTML={{ __html: marked(post.source) }}></span>
          </div>
          {(user || Number(post.comments) > 0) &&
            <div className="card-footer bg-transparent">
              <div>
                {user &&
                  <a className="btn btn-outline-secondary btn-sm" href={`/posts/${post.id}`}>Comment</a>
                }
                {Number(post.comments) > 0 &&
                  <a className="ms-3 noDecoration" href={`/posts/${post.id}`}>{post.comments} Comment{post.comments === "1" ? "" : "s"}</a>
                }
              </div>
            </div>
          }
        </div>
      )}
    </>
  );
}
