# nrc-headlamp-plugin

This is the default template README for [Headlamp Plugins](https://github.com/kubernetes-sigs/headlamp).

- The description of your plugin should go here.
- You should also edit the package.json file meta data (like name and description).

## Developing Headlamp plugins

For more information on developing Headlamp plugins, please refer to:

- [Getting Started](https://headlamp.dev/docs/latest/development/plugins/), How to create a new Headlamp plugin.
- [API Reference](https://headlamp.dev/docs/latest/development/api/), API documentation for what you can do
- [UI Component Storybook](https://headlamp.dev/docs/latest/development/frontend/#storybook), pre-existing components you can use when creating your plugin.
- [Plugin Examples](https://github.com/kubernetes-sigs/headlamp/tree/main/plugins/examples), Example plugins you can look at to see how it's done.

## Testing

This plugin is fully covered by robust unit tests using **Vitest** and **React Testing Library (@testing-library/react)**. We mock Headlamp's internal UI components (such as `ResourceListView` and `DetailsGrid`) to isolate and test our custom column mappers and data formatting logic.

To run the test suite locally:

```bash
# Run all frontend tests
npm run test

# Alternatively, run vitest directly (useful on Windows)
npx vitest run
```
