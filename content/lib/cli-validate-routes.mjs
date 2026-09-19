import { loadRoutingDocs, validateRoutingDocs } from './routes.mjs';

const { routes, redirects, navigation } = await loadRoutingDocs();
const errors = validateRoutingDocs(routes, redirects, navigation);

if (errors.length) {
  console.error('Routing validation failed:\n' + errors.map((e) => ` - ${e}`).join('\n'));
  process.exit(1);
}

console.log(
  `Routing OK: ${routes.routes.length} routes × 3 locales; ${redirects.redirects.length} redirects; header items=${navigation.header.items.length}`,
);
