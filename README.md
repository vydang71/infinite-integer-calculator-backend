# Infinite integer calculator backend

### Run app on localhost

- Make sure you run the application with node version 14.16.0
- Create a `.env` file from the `example.env` file. Fill in the environment variables.

```sh
npm i
npm run dev
```

### Test this app

- Run: API explorer is running at http://127.0.0.1:3001/explorer
- Ex:
  [POST] /calculations
  Request body: { "question": "108040000000000000100000000000000000 + 100000000000000004100000000000000000"}
