import { NotFoundView } from '../error';

export default function MyListView() {
  const trelloDashboard = process.env.TRELLO_DASHBOARD;

  return (
    <div>
      {trelloDashboard ? (
        <iframe
          src={trelloDashboard}
          frameBorder="0"
          width="100%"
          height="800"
          title="trello-dashboard"
          draggable="true"
          data-cy="trello-embed-dashboard"
        />
      ) : (
        <NotFoundView />
      )}
    </div>
  );
}
