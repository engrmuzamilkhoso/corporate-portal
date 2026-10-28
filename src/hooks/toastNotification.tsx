import { toast, ToastOptions } from 'react-toastify';

const useToastNotification = () => {
  const defaultOptions: ToastOptions = {
    position: "bottom-right",
    autoClose: 5000, // Default autoClose value
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  const showToast = (
    type: 'info' | 'success' | 'warn' | 'error' | 'default',
    message: string,
    options?: ToastOptions // Include options for onClose and autoClose
  ) => {
    // Set autoClose from options or fallback to default value
    const finalOptions = {
      ...defaultOptions,
      autoClose: options?.autoClose !== undefined ? options.autoClose : defaultOptions.autoClose,
      ...options,
    };

    switch (type) {
      case 'info':
        toast.info(message, finalOptions);
        break;
      case 'success':
        toast.success(message, finalOptions);
        break;
      case 'warn':
        toast.warn(message, finalOptions);
        break;
      case 'error':
        toast.error(message, finalOptions);
        break;
      default:
        toast(message, finalOptions);
        break;
    }
  };

  return { showToast };
};

export default useToastNotification;
