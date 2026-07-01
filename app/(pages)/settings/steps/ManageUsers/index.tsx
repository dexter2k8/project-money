"use client";
import { useEffect, useRef, useState } from "react";
import { SquarePlus } from "lucide-react";
import { toast } from "react-toastify";
import { useSWR } from "@/app/hooks/useSWR";
import { DeleteUser } from "@/app/services/fetchers/auth";
import { API } from "@/app/utils/paths";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { getColumns } from "./columns";
import UserModal from "./UserModal";
import type { IUser } from "@/app/api/auth/get-self-user/types";
import type { IActionsProps } from "./types";

export function ManageUsers() {
  const [action, setAction] = useState<IActionsProps>();
  const [loading, setLoading] = useState(false);
  const deleteTriggerRef = useRef<HTMLSpanElement>(null);
  const columns = getColumns({ onAction: setAction });

  const { response: userList, isLoading, mutate } = useSWR<IUser[]>(API.AUTH.LIST_USERS);

  useEffect(() => {
    if (action?.action === "delete") {
      deleteTriggerRef.current?.click();
    }
  }, [action]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await DeleteUser(action?.id as string);

      toast.success("User deleted successfully");
    } catch {
      toast.error("Failed to delete user");
    }
    mutate();
    setAction(undefined);
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between py-1 px-4">
        <h4>Users</h4>
        <SquarePlus
          size="2rem"
          onClick={() => setAction({ action: "add", id: undefined })}
          style={{ cursor: "pointer" }}
        />
      </div>
      <Table loading={isLoading} columns={columns} rows={userList || []} />
      <UserModal
        action={action?.action}
        userData={userList?.find((t) => t.uid === action?.id)}
        open={action !== undefined && action?.action !== "delete"}
        onClose={() => setAction(undefined)}
        onMutate={mutate}
      />
      <Modal
        title="Delete User"
        subtitle="Are you sure you want to delete this user?"
        onClose={() => setAction(undefined)}
        content={
          <div className="p-4 flex flex-col gap-4">
            <div className="flex justify-end gap-4">
              <Button onClick={() => setAction(undefined)}>Cancel</Button>
              <Button variant="primary" loading={loading} onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        }
      >
        <span ref={deleteTriggerRef} className="hidden" />
      </Modal>
    </div>
  );
}
