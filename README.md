<p align="center">
  <a href="https://www.github.com/perseidesjs">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.r/dark.png" width="64" height="64">
    <source media="(prefers-color-scheme: light)" srcset="./.r/light.png" width="64" height="64">
    <img alt="Perseides logo" src="./.r/light.png" width="64" height="64">
    </picture>
  </a>
</p>
<h1 align="center">
  @perseidesjs/medusa-plugin-rate-limit
</h1>

<p align="center">
  <img src="https://img.shields.io/npm/v/@perseidesjs/medusa-plugin-rate-limit" alt="npm version">
  <img src="https://github.com/perseidesjs/medusa-plugin-rate-limit/actions/workflows/npm-publish.yml/badge.svg" alt="Tests">
  <img src="https://badgen.net/badge/dependencies/none/green" alt="No dependencies">
  <img src="https://img.shields.io/github/license/perseidesjs/medusa-plugin-rate-limit" alt="GitHub license">
</p>

<h4 align="center">
  <a href="https://perseides.org">Website</a> |
  <a href="https://www.medusajs.com">Medusa</a>
</h4>

<p align="center">
  A simple rate-limitting plugin for Medusa.
</p>

<h2>
 Purpose
</h2>

<p>This plugin was mainly built to protect your MedusaJS application from abuse. This plugin allows you to easily manage request limits without stepping outside the familiar Medusa environment.</p>

<h3>Why Rate Limiting Matters</h3>

<ol>
  <li><strong>Shield Against Attacks</strong>: Prevent Denial of Service (DoS) attempts by capping the number of requests from a single source.</li>
  <li><strong>Boost Security</strong>: Thwart brute force attacks and other automated threats by controlling request frequency.</li>
  <li><strong>Easy Setup</strong>: Seamlessly integrate rate limiting into your existing Medusa configuration files.</li>
</ol>

<h2>
  Installation
</h2>

```bash
npm install @perseidesjs/medusa-plugin-rate-limit
```

<h2>
  Usage
</h2>
<p>
This plugin uses the <a href="https://docs.medusajs.com/v2/resources/architectural-modules/cache#main">CacheModule</a> available (<i>InMemory, Redis, etc.</i>) under the hood and exposes a simple middleware to limit the number of requests per IP address.
</p>

<h2>
  How to use
</h2>

<p>
    If you want to start restricting certain routes, you can import the <code>defaultRateLimit</code> middleware from the plugin and then use it as follows:
</p>

```ts
// src/api/middlewares.ts
import { defineMiddlewares } from "@medusajs/medusa"
import { defaultRateLimit } from '@perseidesjs/medusa-plugin-rate-limit'

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/custom*",
      middlewares: [defaultRateLimit()],
    },
  ],
})
```

<p>
  You can also pass some custom options to have a complete control over the rate limiting mechanism as follows:
</p>

```ts
// src/api/middlewares.ts
import { defineMiddlewares } from "@medusajs/medusa"
import { defaultRateLimit } from '@perseidesjs/medusa-plugin-rate-limit'

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/custom*",
      middlewares: [defaultRateLimit({
				limit: 10,
				window: 60,
			})],
    },
  ],
})
```
<blockquote>
 In this example, the rate limiting mechanism will allow 10 requests per minute per IP address.
</blockquote>

<h3>Granular control over rate limiting</h3>

<p>
  The choice of having options directly inside the middleware instead of globally inside the plugin options was made to provide greater flexibility. This approach allows users to be more or less restrictive on certain specific routes. By specifying options directly within the middleware, you can tailor the rate limiting mechanism to suit the needs of individual routes, rather than applying a one-size-fits-all configuration globally. This ensures that you can have fine-grained control over the rate limiting behavior, making it possible to adjust the limits based on the specific requirements of each route.
</p>

<p>
  Additionally, you can still use the plugin options to update the default global values, such as the limit and window. This allows you to set your own default values that will be applied across many routes, while still having the flexibility to specify more granular settings for specific routes. By configuring the plugin options, you can establish a baseline rate limiting policy that suits the majority of your application, and then override these defaults as needed for particular routes.
</p>

<h3> Default configuration </h3>

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>limit</td>
      <td><code>Number</code></td>
      <td><code>5</code></td>
      <td>The number of requests allowed in the given time window</td>
    </tr>
    <tr>
      <td>window</td>
      <td><code>Number</code></td>
      <td><code>60</code></td>
      <td>The time window in seconds</td>   
    </tr>
  </tbody>
</table>


<h3> Plugin options </h3>

```ts
// medusa-config.js
const { loadEnv, defineConfig } = require('@medusajs/framework/utils')

loadEnv(process.env.NODE_ENV, process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  plugins: [
    {
      resolve: "@perseidesjs/medusa-plugin-rate-limit",
      options: {
        limit: 50,
        window: 60,
      },
    },
  ],
})
```

<h2>License</h2>
<p> This project is licensed under the MIT License - see the <a href="./LICENSE.md">LICENSE</a> file for details</p>