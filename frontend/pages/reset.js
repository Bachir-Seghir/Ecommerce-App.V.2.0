import Link from 'next/link';
import Reset from '../components/Reset';
export default function resetPage({ query }) {
  if (!query.token) {
    return (
      <div>
        <p>Sorry you must sypply a token -- please click the link bellow</p>
        <Link href="/request">Request a password reset</Link>
      </div>
    );
  }
  return <Reset token={query.token} />;
}
