import { useEffect, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Tooltip } from "react-tooltip";
import { PatchUser, PostUser } from "@/app/services/fetchers/auth";
import { editUserSchema, postUserSchema } from "@/app/validations/auth";
import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import type { Resolver, SubmitHandler } from "react-hook-form";
import type { IUser } from "@/app/api/auth/get-self-user/types";
import type { TPostUserArgs } from "@/app/api/auth/sign-up/types";
import type { TAction } from "./types";

interface IUserForm {
  displayName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  photoURL?: string;
}

interface IUserModalProps {
  onMutate: () => void;
  userData?: IUser;
  action?: TAction;
  open: boolean;
  onClose: () => void;
}

export default function UserModal({ userData, action, onMutate, open, onClose }: IUserModalProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, setValue, reset } = useForm<IUserForm>({
    resolver: yupResolver(
      action === "add" ? postUserSchema : editUserSchema,
    ) as Resolver<IUserForm>,
  });

  const onSubmit: SubmitHandler<IUserForm> = async (data) => {
    if (!userData?.uid) return;

    setLoading(true);
    if (action === "add") await PostUser(data as TPostUserArgs);
    if (action === "edit") await PatchUser(userData.uid, data);
    onMutate();
    setLoading(false);

    onClose();
    reset();
  };

  useEffect(() => {
    if (userData) {
      setValue("displayName", userData.displayName || "");
      setValue("email", userData.email || "");
      if (userData.photoURL) setValue("photoURL", userData.photoURL);
    } else {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  useEffect(() => {
    if (open) {
      triggerRef.current?.click();
    }
  }, [open]);

  const handleCloseModal = () => {
    onClose();
    reset();
  };

  const formContent = (
    <form key={userData?.uid ?? "new"} className="p-4">
      <label htmlFor="displayName">Name</label>
      <Input.Controlled type="search" control={control} name="displayName" id="displayName" />

      <label htmlFor="email">Email</label>
      <Input.Controlled type="search" control={control} name="email" id="email" />

      <label htmlFor="password">Password</label>
      <div className="flex items-center gap-2">
        {action === "edit" && (
          <Checkbox
            data-tooltip-id="checkbox-password"
            data-tooltip-content="Check this if you want to set a new password"
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
        )}
        <Input.Controlled
          disabled={action === "edit" && !checked}
          type="password"
          control={control}
          name="password"
          id="password"
          autoComplete="new-password"
        />
        <Tooltip id="checkbox-password" style={{ maxWidth: "12rem" }} />
      </div>

      <label htmlFor="photoURL">Avatar URL (optional)</label>
      <Input.Controlled type="search" control={control} name="photoURL" id="photoURL" />
    </form>
  );

  return (
    <Modal
      title={userData ? "Edit User" : "Add User"}
      onClose={handleCloseModal}
      onApply={handleSubmit(onSubmit)}
      width="17rem"
      cross
      content={formContent}
      applyLoading={loading}
    >
      <span ref={triggerRef} className="hidden" />
    </Modal>
  );
}
