/** Local `yarn dev` port — keep in sync with the `dev` script in package.json */
export const DEV_SERVER_PORT = 7777 as const;

export const DEV_SITE_URL = `http://localhost:${DEV_SERVER_PORT}` as const;
