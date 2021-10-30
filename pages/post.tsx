import React from 'react'
import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'aleph/react'
import marked from 'marked';
import hljs from 'highlight.js';
import { UserContext } from '~/lib/UserContext.ts'
import { request } from '~/lib/request.ts'
import type { RequestType, ResponseType } from '~/api/create_post.ts'

export default function Post() {
  const router = useRouter();

  const user = useContext(UserContext);

  const [flag, setFlag] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>("");

  function displayEdit() {
    setFlag(true);
  }

  function displayPreview() {
    setFlag(false);
  }

  useEffect(() => {
    console.debug("useEffect");
    hljs.highlightAll();
  });

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setText(event.target.value);
  }

  async function post() {
    setLoading(true)
    const result = await request<RequestType, ResponseType>("create_post", { source: text });
    setLoading(false)
    if (result.postId) {
      router.push(`/posts/${result.postId}`);
      return;
    }
  }

  return (
    <>
      <head>
        <title>Post - md-sns</title>
      </head>
      {user &&
        <div className="card mb-3">
          <div className="card-body">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <a className={flag ? "nav-link active" : "nav-link"} onClick={displayEdit}>Edit</a>
              </li>
              <li className="nav-item">
                <a className={!flag ? "nav-link active" : "nav-link"} onClick={displayPreview}>Preview</a>
              </li>
            </ul>
            {flag &&
              <textarea className="form-control mt-3" style={{ height: "500px" }} maxLength={10000} value={text} onChange={handleChange} placeholder="Write with markdown"></textarea>
            }
            {!flag &&
              <span dangerouslySetInnerHTML={{ __html: marked(text) }}></span>
            }
          </div>
          <div className="card-footer bg-transparent">
            <button className="btn btn-primary" onClick={post} disabled={loading || text.length === 0}>
              {loading &&
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              }
              Post
            </button>
          </div>
        </div>
      }
    </>
  );
}
