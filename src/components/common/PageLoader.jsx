// Shown while a page's code is downloading (pages are loaded on first visit, see App.jsx)
export default function PageLoader() {
    return (
        <div className="w-full min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading page">
            <div className="h-7 w-7 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
        </div>
    );
}
