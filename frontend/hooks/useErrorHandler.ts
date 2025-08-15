import { useDispatch } from "react-redux";
import { showToast } from "../redux/slices/toastSlice";
import { ToastType } from "../redux/types/ToastType";

export const useErrorHandler = () => {
  const dispatch = useDispatch();

  const handleError = (error: any, customTitle?: string) => {
    console.error("Error caught:", error);

    // Extract meaningful error message
    let errorMessage = "予期しないエラーが発生しました";

    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.errors && error.errors.length > 0) {
      // Handle GraphQL errors from Amplify
      errorMessage = error.errors[0].message || errorMessage;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    dispatch(
      showToast({
        title: customTitle || "エラーが発生しました",
        context: errorMessage,
        type: ToastType.Error,
      })
    );
  };

  return { handleError };
};
