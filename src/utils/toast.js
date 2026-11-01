// App-wide toasts without prop drilling: any module can call showErrorToast(), and the
// <GlobalToaster /> mounted in App renders it.
export const TOAST_EVENT = "app:toast";

export const showErrorToast = (message) => {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, kind: "error" } }));
};
