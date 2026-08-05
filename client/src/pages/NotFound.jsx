import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const NotFound = () => (
  <PageLayout title="404" subtitle="This slice fell off the table." width="md" isFloating>
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="text-6xl">🍕</span>
      <p className="text-sm text-muted">
        The page you're looking for doesn't exist — or got eaten before you got here.
      </p>
      <Link to="/" className="btn-primary px-6 py-3 text-sm font-bold">
        Back to the kitchen
      </Link>
    </div>
  </PageLayout>
);

export default NotFound;
