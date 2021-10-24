
import React from 'react'
import { useEffect, useState } from 'react'
import ReactModal from 'https://esm.sh/react-modal@3.14.3';
import Users from '~/components/users.tsx'
import { request } from '~/lib/request.ts'
import type { RequestType as LikeUsersRequest, ResponseType as LikeUsersResponse } from "~/api/get_like_users.ts";

export default function LikeUsersModal(props: { postId: number, modal: boolean, setModal: React.Dispatch<React.SetStateAction<boolean>> }) {

  const [users, setUsers] = useState<LikeUsersResponse>([]);

  function closeModal() {
    props.setModal(false);
  }

  useEffect(() => {
    request<LikeUsersRequest, LikeUsersResponse>("get_like_users", { postId: props.postId }).then(a => {
      console.log(users);
      setUsers(a);
    });
  }, []);

  return (
    <ReactModal
      isOpen={props.modal}
      contentLabel="Likes"
      onRequestClose={closeModal}
      className="modal-dialog"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Likes</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeModal}></button>
        </div>
        <div className="modal-body">
          <Users users={users} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={closeModal}>Close</button>
        </div>
      </div>
    </ReactModal>);
}