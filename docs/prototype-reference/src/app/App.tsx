import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";

// App root — SmartContact Supervisor (DD#295)
// Build trigger: refresh
export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            border: "1px solid #D1D5DB",
            borderRadius: "0",
            color: "#374151",
            fontSize: "13px",
            padding: "10px 14px",
          },
        }}
      />
    </>
  );
}