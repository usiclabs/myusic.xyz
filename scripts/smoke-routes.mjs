const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000"
const routes = [
  "/",
  "/discover",
  "/explore",
  "/artists",
  "/search",
  "/following",
  "/activity-feed",
  "/dashboard",
  "/dashboard/upload",
  "/dashboard/analytics",
  "/wallet",
  "/swap",
  "/staking",
  "/rewards",
  "/studio",
  "/live",
  "/agents",
  "/nft-marketplace",
]

const results = await Promise.all(
  routes.map(async (route) => {
    try {
      const response = await fetch(new URL(route, baseUrl), {
        signal: AbortSignal.timeout(40_000),
      })
      const contentType = response.headers.get("content-type") || ""
      return {
        route,
        status: response.status,
        ok: response.ok && contentType.includes("text/html"),
      }
    } catch (error) {
      return {
        route,
        status: "ERR",
        ok: false,
        error: error instanceof Error ? error.message : "Unknown request error",
      }
    }
  }),
)

for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"} ${result.status} ${result.route}`)
}

const failures = results.filter((result) => !result.ok)
if (failures.length > 0) process.exit(1)
