import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: unknown): State {
    const message = err instanceof Error ? err.message : 'שגיאה לא צפויה';
    return { hasError: true, message };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4" dir="rtl">
        <div className="bg-card rounded-2xl shadow-card p-8 max-w-md w-full text-center animate-scale-in">
          <div className="text-4xl mb-4">🔧</div>
          <h2 className="text-xl font-bold mb-2">משהו השתבש</h2>
          <p className="text-sm text-muted-foreground mb-6">
            CountMe עודכן ממש עכשיו. רענן את הדף כדי להמשיך.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="gradient-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl"
          >
            רענן עמוד
          </button>
          <p className="text-xs text-muted-foreground mt-4 opacity-60">{this.state.message}</p>
        </div>
      </div>
    );
  }
}
