import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message, options = {}) => sonnerToast.success(message, options),
  error: (message, options = {}) => sonnerToast.error(message, options),
  info: (message, options = {}) => sonnerToast.message(message, options),
  warning: (message, options = {}) => sonnerToast.warning(message, options),
};

export default toast;


