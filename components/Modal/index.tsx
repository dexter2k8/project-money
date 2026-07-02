"use client";
import { useEffect, useState } from "react";
import { cx } from "class-variance-authority";
import { createPortal } from "react-dom";
import { CONTENT, OVERLAY } from "./constants";
import Button from "../Button";
import type { IModalProps, IModalWrapperProps } from "./types";

const ModalComponent: React.FC<IModalProps> = ({
  isOpen,
  onClose,
  onApply,
  loadingApply,
  disabledApply,
  children,
  title,
  subtitle,
  cross,
  width,
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setIsAnimatingOut(true);
  }

  const handleAnimationEnd = () => {
    if (!isOpen) setIsAnimatingOut(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen && !isAnimatingOut) return null;

  const handleApply = async () => {
    if (!onApply) {
      onClose?.();
      return;
    }
    const result = await onApply();
    if (result !== false) onClose?.();
  };

  return createPortal(
    <div
      className={isOpen ? OVERLAY : cx(OVERLAY, "animate-[modal-fade-out_0.3s_forwards]")}
      onClick={onClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={CONTENT} onClick={(e) => e.stopPropagation()} style={{ width }}>
        {title || subtitle ? (
          <div className="p-4 border-b border-gray-200">
            {title && <h4>{title}</h4>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
        ) : null}

        {cross && (
          <Button variant="link" className="absolute text-lg! top-4 right-4" onClick={onClose}>
            x
          </Button>
        )}

        {children}

        <div className="flex justify-end gap-4 p-4 border-t border-gray-200">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleApply}
            loading={loadingApply}
            disabled={disabledApply}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const Modal: React.FC<IModalWrapperProps> = ({ content, onClose, children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    onClose?.();
    setIsOpen(false);
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>
      <ModalComponent
        isOpen={isOpen}
        onClose={handleClose}
        width={props.width}
        title={props.title}
        subtitle={props.subtitle}
        cross={props.cross}
        onApply={props.onApply}
        loadingApply={props.loadingApply}
        disabledApply={props.disabledApply}
      >
        {content}
      </ModalComponent>
    </>
  );
};

export default Modal;
