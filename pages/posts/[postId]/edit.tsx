import React from 'react'
import { useEffect, useContext, useState } from 'react'
import hljs from 'https://esm.sh/highlight.js';
import marked from 'https://esm.sh/marked@2.0.1';
import { UserContext } from '~/lib/UserContext.ts'
import { useRouter } from 'aleph/react'
import { request } from '~/lib/request.ts'
import type { RequestType, ResponseType } from "~/api/get_post.ts";
import type { RequestType as UpdateRequest, ResponseType as UpdateResponse } from '~/api/update_post.ts'

export default function Edit() {
  const router = useRouter();

  const postId = Number(router.params.postId);
  console.debug("start", postId, router.routePath);

  const user = useContext(UserContext);
  if (user === null) {
    router.push(`/`);
    return;
  }

  const [flag, setFlag] = useState<boolean>(true);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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

  useEffect(() => {
    console.debug("useEffect");
    (async () => {
      const result = await request<RequestType, ResponseType>("get_post", { postId });
      if (!result) {
        router.push(`/`);
        return;
      }
      if (result.user_id !== user?.appId) {
        router.push(`/`);
        return;
      }
      setText(result.source);
    })();
  }, []);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setText(event.target.value);
  }

  async function save() {
    if (confirm("Save the post?")) {
      setLoading(true);
      await request<UpdateRequest, UpdateResponse>("update_post", { postId: postId, source: text });
      setLoading(false);
      router.push(`/posts/${postId}`);
    }
  }

  return (
    <>
      <head>
        <title>Edit - md-sns</title>
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
              <textarea className="form-control mt-3" style={{ height: "500px" }} maxLength={10000} value={text} onChange={handleChange}></textarea>
            }
            {!flag &&
              <span dangerouslySetInnerHTML={{ __html: marked(text) }}></span>
            }
          </div>
          <div className="card-footer bg-transparent">
            <button className="btn btn-primary" onClick={save} disabled={loading || text.length === 0}>
              {loading &&
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              }
              Save
            </button>
          </div>
        </div>
      }
    </>
  );
}
