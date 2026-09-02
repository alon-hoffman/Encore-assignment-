# Vehicle Info API

A tiny TypeScript API for Vercel that forwards vehicle lookups to an existing
service. It is intentionally a thin integration wrapper: it validates and
normalizes `license_plate`, calls the upstream API, and maps upstream failures
to a small, predictable response shape.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

The Vercel CLI will print the local URL, normally `http://localhost:3000`.
The endpoint is `POST /api/vehicle-info`.

You can also check the TypeScript without starting the server:

```bash
npm run typecheck
```

## Example requests

Successful lookup (when the upstream service recognizes the plate):

```bash
curl -X POST \
  "https://YOUR-VERCEL-DOMAIN.vercel.app/api/vehicle-info" \
  -H "Content-Type: application/json" \
  -d '{"license_plate":"12345678"}'
```

Invalid or missing license plate:

```bash
curl -X POST \
  "https://YOUR-VERCEL-DOMAIN.vercel.app/api/vehicle-info" \
  -H "Content-Type: application/json" \
  -d '{}'
```

The invalid request returns HTTP 400:

```json
{
  "success": false,
  "error": "license_plate is required"
}
```

For local requests, replace the deployed URL with
`http://localhost:3000/api/vehicle-info`.

## Deploy to Vercel

### From GitHub

1. Create an empty GitHub repository.
2. Commit this project and push it to that repository.
3. In the Vercel dashboard, choose **Add New > Project**.
4. Import the GitHub repository.
5. Keep the detected/default settings and select **Deploy**.

No environment variables, database, or extra configuration are required.

### From the command line

After installing dependencies, run:

```bash
npx vercel
```

Follow the prompts. For a production deployment, run `npx vercel --prod`.
