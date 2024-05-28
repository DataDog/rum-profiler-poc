# RUM Profiler

This is a PoC of the RUM Profiler that collects performance data from the user's browser. It utilizes the [JS Self-Profiling API](https://wicg.github.io/js-self-profiling/).

As of the writing of this README, the JS Self-Profiling API is available in [Chrome 94+, Edge 94+, and Opera 80+](https://caniuse.com/mdn-api_profiler) browsers.

## Setup

#### 1. Add `Document-Policy` HTTP header

The JS Self-Profiling API requires the `Document-Policy: js-profiling` HTTP header to be present when loading an HTML document. It is only required for the HTML document; you don't need it for JavaScript resources.

Express.js middleware example:

```javascript
function jsProfilingDocumentPolicy(req, res, next) {
  if (req.accepts('html')) {
    // Add Document-Policy: js-profiling header if user requests HTML document
    res.set('Document-Policy', 'js-profiling')
  }
  next()
}
app.use(jsProfilingDocumentPolicy)
```

#### 2. Setup [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) script loading if needed

This step is required only if your JavaScript files are served from a **different origin**. For example, an HTML document is served from `myapp.com`, and JavaScript files are served from `static.myapp.com`.

If that's the case, you have to use [_cors_ script loading](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin); otherwise, these JavaScript files will be [invisible for the profiler](https://wicg.github.io/js-self-profiling/#cross-origin-script-contents). By default, your browser loads JavaScript in _no-cors_ mode.

To opt-in for _cors_ mode, you have to:

1.  Add `crossorigin="anonymous"` attribute to `<script />` tags
2.  Ensure that JavaScript response includes the `Access-Control-Allow-Origin: *` HTTP header

> [!CAUTION]
> The `Access-Control-Allow-Origin` header is very important; without this header, **your browser will reject the script!**
>
> [A common pitfall when switching between "no-cors" and "cors" mode is **browser cache** / **Vary** header](https://stackoverflow.com/questions/44800431/caching-effect-on-cors-no-access-control-allow-origin-header-is-present-on-th). This can cause hard-to-reproduce bugs, so please ensure that you return the `Vary: Origin, Access-Control-Request-Headers, Access-Control-Request-Method` HTTP header for _no-cors_ requests before switching to the _cors_ mode.

> [!TIP]
> For webpack users:
>
> - You can set the [`output.crossOriginLoading: "anonymous"`](https://webpack.js.org/configuration/output/#outputcrossoriginloading) option.
> - You can also modify the [`output.hashSalt`](https://webpack.js.org/configuration/output/#outputhashsalt) option when switching to the _cors_ mode to "invalidate" the browser cache.

#### 3. Upload Source Maps to Datadog

Profiling will work without this step, but using the profile of a minified JavaScript file can be challenging. If you upload your Source Maps, we will be able to unminify stack traces in other products, such as Error Tracking.

[Instruction for JavaScript Source Maps upload](https://docs.datadoghq.com/real_user_monitoring/guide/upload-javascript-source-maps/?tab=webpackjs)

```shell
# TLDR;
datadog-ci sourcemaps upload path/to/build/artifacts \
  --service=my-service \
  --release-version=my-version
```

#### 4. Install the package

This package is available only on GitHub. We will integrate it into the RUM package in the future.

```shell
# Replace {commit-hash} with a real commit hash
# NPM
npm install git+https://github.com/DataDog/rum-profiler-poc.git#{commit-hash}
# Yarn 1
yarn add https://github.com/DataDog/rum-profiler-poc#{commit-hash}
# Yarn 2+
yarn add @datadog/rum-profiler-poc@github:DataDog/rum-profiler-poc#{commit-hash}
```

#### 5. Setup the profiler

Import and call the `initRumProfiler()` function:

```typescript
import { initRumProfiler } from '@datadog/rum-profiler-poc'

initRumProfiler({
  applicationId: 'my-application-id',
  clientToken: 'my-client-token', // you can re-use client token that you use for RUM/Logs
  service: 'my-service', // keep in sync with `--service` passed to datadog-ci sourcemaps upload command
  version: 'my-version', // keep in sync with `--release-version` passed to datadog-ci sourcemaps upload command
  profilingSampleRate: 10, // run profiler for 10% of sessions
})
```

#### 6. Check the setup

If everything went well, you should observe a request to `https://browser-intake-datadoghq.com/api/v2/profile` every minute on your page (with `202 Accepted` response). Profiles should appear on the APM / Profiles page, tagged with the specified `service` and `version`. Additionally, you can utilize the `session_id` attribute to find profiles from a specific RUM session. Keep in mind that it might take up to 3 minutes from the intake to profile being visible on the page.

#### 7. Finish

Congratulations! We understand that setting up might be a little challenging, but now you have high-resolution performance data for your application! Let us know what you find useful, what is confusing, and what is missing.

### Playground

To test the feature, you can run built-in playground. To make it work, copy the `./playground/.env` file into `./playground/.env.local` and update the `VITE_CLIENT_TOKEN` environment variable to a valid Datadog Client Token.

To run the playground:

```shell
yarn playground
```

## License

[Apache 2.0](https://github.com/DataDog/rum-profiler-poc/blob/main/LICENSE.md)
