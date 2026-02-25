/**
 * Ite Nnem - InfinityFree Bypass Proxy
 * This function intercepts /api/* requests and fetches them from InfinityFree
 * while spoofing the User-Agent as Googlebot to bypass the AES challenge.
 */
export default async (request, context) => {
  const url = new URL(request.url);
  
  // Get the path (e.g., /api/menu.php)
  const apiPath = url.pathname; 
  
  // Construct the target URL on InfinityFree
  const targetUrl = `https://itennem.gt.tc${apiPath}`;

  console.log(`[Proxy] Fetching: ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        // This is the magic: Googlebot is allowed to bypass the cookie check
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept": "application/json",
      },
    });

    // Check if we got the challenge page again
    const text = await response.text();
    
    if (text.includes('aes.js') || text.includes('javascript')) {
      console.error("[Proxy] Still getting challenge page. InfinityFree is being stubborn.");
      return new Response(JSON.stringify({ 
        error: "InfinityFree blocked the proxy. Try refreshing.",
        debug: text.substring(0, 100)
      }), {
        status: 503,
        headers: { "content-type": "application/json" }
      });
    }

    return new Response(text, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "access-control-allow-origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
};
