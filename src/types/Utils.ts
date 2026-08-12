export type PopupAlertProps = {
    severity: "success" | "info" | "warning" | "error";
    message: string;
    closeModal: () => void;
};


export type LoginProps = {
    closeModal: () => void;
};

export interface SidebarProps {
  open: boolean;
  setOpen: (state: boolean) => void;
}