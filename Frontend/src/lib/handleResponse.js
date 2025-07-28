import toast from "react-hot-toast";


export const handleError = (msg) => {
    toast.error(msg || 'Error Occurred.');
}

export const handleSuccess = (msg) => {
    toast.success(msg || "success");
}