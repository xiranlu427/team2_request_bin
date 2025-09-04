// The `body` property is yet to be added, will be added after MongoDB is added
const Request = ({ request }) => {
  const date = new Date(request.timestamp);
  const dateString = date.toDateString();
  const timeString = date.toTimeString();

  return (
    <div>
      <p>
        {request.method}<br />
        {dateString}<br />
        {timeString}<br />
      </p>
      <tabele>
        <tr>
          <th>Headers</th>
          <td>{request.headers}</td>
        </tr>
        <tr>
          <th>Body</th>
          <td>{request.body}</td>
        </tr>
      </tabele>
    </div>
  )
}

export default Request;
