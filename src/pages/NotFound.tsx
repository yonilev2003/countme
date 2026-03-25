import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="text-center animate-fade-up">
        <h1 className="text-6xl font-extrabold mb-4">404</h1>
        <p className="text-muted-foreground mb-6">הדף שחיפשת לא נמצא</p>
        <button
          onClick={() => navigate('/')}
          className="gradient-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl"
        >
          חזרה לעמוד הבית
        </button>
      </div>
    </div>
  );
}
