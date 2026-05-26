import { Link } from "react-router-dom";

export default function AuthPlaceholder({ title, message }) {
  return (
    <div className="min-h-screen bg-ipl-dark flex items-center justify-center p-6">
      <div className="card max-w-sm p-8 text-center">
        <h1 className="text-lg font-semibold text-ipl-gold mb-2">{title}</h1>
        <p className="text-xs text-gray-500 mb-6">{message}</p>
        <Link to="/login" className="btn-primary inline-block px-6">
          Back to login
        </Link>
      </div>
    </div>
  );
}
