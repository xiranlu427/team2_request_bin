// The properties will change based on request format, in case the request is an array, then values will be referenced by index
const Request = ({ request }) => {
  const date = new Date(request.arrival_timestamp);
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