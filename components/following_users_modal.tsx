
import React from 'react'
import { useEffect, useState } from 'react'
import ReactModal from 'react-modal';
import Users from '~/components/users.tsx'
import { request } from '~/lib/request.ts'
import type { RequestType, ResponseType } from "~/api/get_following_users.ts";

export default function FollowingUsersModal(props: { userId: number, modal: boolean, setModal: React.Dispatch<React.SetStateAction<boolean>> }) {

  const [users, setUsers] = useState<ResponseType>([]);
  const [loading, setLoading] = useState<boolean>(false);

  function closeModal() {
    props.setModal(false);
  }

  useEffect(() => {
    setLoading(true);
    request<RequestType, ResponseType>("get_following_users", { userId: props.userId }).then(a => {
      setLoading(false);
      setUsers(a);
    });
  }, []);

  return (
    <ReactModal
      isOpen={props.modal}
      contentLabel="Following"
      onRequestClose={closeModal}
      className="modal-dialog"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Following</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeModal}></button>
        </div>
        <div className="modal-body">
          {loading &&
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          }
          <Users users={users} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={closeModal}>Close</button>
        </div>
      </div>
    </ReactModal>);
}
