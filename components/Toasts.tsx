import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"


const contextClass = {
    success: "bg-green-600 dark:bg-green-900",
    error: "bg-red-600 dark:bg-red-900",
    info: "bg-gray-600 dark:bg-gray-900",
    warning: "bg-orange-400 dark:bg-orange-800",
    default: "bg-indigo-600 dark:bg-indigo-900",
    dark: "bg-white-600 dark:bg-white-900",
}

export default function Toast() {
    return <ToastContainer
        toastClassName={({ type = "default" } = {}) => contextClass[type || "default"] +
            " relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer"
        }
        position="bottom-center"
        theme={"colored"}
    />
}
