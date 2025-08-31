INSERT INTO baskets (url_endpoint)
  VALUES 
  ('c7n7wyv'), 
  ('team2isawesome');

INSERT INTO requests (headers, method, body, basket_id)
  VALUES
  (`Accept: */*
Accept-Encoding: gzip, deflate, br
Connection: close
User-Agent: GitHub-Hookshot
X-City: New York City
X-Country: US`, 'POST', 'fake_mongo_id1', 1),
  (`Accept: */*
Accept-Encoding: gzip, deflate, br
Connection: close
User-Agent: PostmanRuntime/7.43.2
X-City: Chicago
X-Country: US`, 'GET', NULL, 1),
(`Accept: */*
Accept-Encoding: gzip, deflate, br
Connection: close
User-Agent: PostmanRuntime/7.43.2
X-City: San Francisco
X-Country: US`, 'POST', 'fake_mongo_id2', 2);