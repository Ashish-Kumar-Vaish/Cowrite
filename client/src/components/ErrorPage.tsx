import { useRouteError } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";

export function ErrorPage({ message }: { message?: string }) {
  const error = useRouteError() as { message?: string };
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div className="card max-w-md w-full text-center p-8">
        <p className="text-6xl mb-6">&#9888;</p>

        <h1 className="font-extrabold text-3xl mb-2">Something broke</h1>

        <p className="text-gray-500 font-medium mb-6">
          {error?.message ?? message ?? "An unexpected error occurred"}
        </p>

        <div className="btn-group justify-center">
          <Button className="btn-primary" onClick={() => navigate(-1)}>
            Go back
          </Button>

          <Button className="btn-secondary" onClick={() => navigate("/")}>
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
