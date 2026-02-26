export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint');

    if (!endpoint) {
        return new Response(JSON.stringify({ error: "No endpoint provided" }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
        });
    }

    const targetUrl = `https://itennem.gt.tc/api/${endpoint}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                "Accept": "application/json",
            }
        });

        const text = await response.text();

        // Check if infinityfree returned an HTML challenge or error page instead of JSON
        if (text.includes('aes.js') || text.includes('javascript') || !text.startsWith('{')) {
            return new Response(JSON.stringify({
                error: "InfinityFree blocked the Vercel proxy.",
                debug: text.substring(0, 100)
            }), {
                status: 503,
                headers: { "content-type": "application/json" }
            });
        }

        return new Response(text, {
            status: 200,
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'access-control-allow-origin': '*',
            },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "content-type": "application/json" }
        });
    }
}
