// Cloudflare Pages Function: creates a Stripe Checkout session for the cart.
//
// Setup (one-time): in the Cloudflare dashboard -> Workers & Pages -> compa ->
// Settings -> Environment variables, add STRIPE_SECRET_KEY (sk_live_... or
// sk_test_...) for Production, then redeploy. Until the key is set this
// endpoint returns 503 and the shop falls back to its email-order flow.
//
// Prices live HERE, server-side — the browser only sends SKUs and quantities,
// so cart tampering can't change what gets charged.

const CATALOG = {
    pinelime4: { name: 'Compa Ranch Water · Pine Lime (4 × 330mL)', cents: 2499 },
    grapefruit4: { name: 'Compa Grapefruit & Blood Orange (4 × 330mL)', cents: 2299 },
    passionfruit4: { name: 'Compa Passionfruit (4 × 330mL)', cents: 2299 },
    ranchlime4: { name: 'Compa Ranch Water · Lime (4 × 330mL)', cents: 2499 },
    fiesta16: { name: 'Compa Fiesta Case (16 mixed cans)', cents: 8499 },
};

const CURRENCY = 'aud';
const SHIPPING_CENTS = 995;
const FREE_SHIP_OVER_CENTS = 6000;

function json(status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;

    if (!env.STRIPE_SECRET_KEY) {
        return json(503, { error: 'not_configured' });
    }

    let items;
    try {
        ({ items } = await request.json());
    } catch (e) {
        return json(400, { error: 'bad_request' });
    }

    const entries = Object.entries(items || {}).filter(
        ([sku, qty]) => CATALOG[sku] && Number.isInteger(qty) && qty > 0 && qty <= 50
    );
    if (entries.length === 0) {
        return json(400, { error: 'empty_cart' });
    }

    const origin = new URL(request.url).origin;
    const params = new URLSearchParams();
    params.set('mode', 'payment');
    params.set('currency', CURRENCY);
    params.set('success_url', origin + '/success.html?session_id={CHECKOUT_SESSION_ID}');
    params.set('cancel_url', origin + '/shop.html');
    params.set('shipping_address_collection[allowed_countries][0]', 'AU');
    params.set('phone_number_collection[enabled]', 'true');
    params.set('custom_text[submit][message]',
        'You must be 18+ to order. ID is checked on delivery. Please drink responsibly.');

    let subtotal = 0;
    entries.forEach(([sku, qty], i) => {
        const p = CATALOG[sku];
        subtotal += p.cents * qty;
        params.set(`line_items[${i}][price_data][currency]`, CURRENCY);
        params.set(`line_items[${i}][price_data][product_data][name]`, p.name);
        params.set(`line_items[${i}][price_data][unit_amount]`, String(p.cents));
        params.set(`line_items[${i}][quantity]`, String(qty));
    });

    const shipCents = subtotal >= FREE_SHIP_OVER_CENTS ? 0 : SHIPPING_CENTS;
    params.set('shipping_options[0][shipping_rate_data][display_name]',
        shipCents === 0 ? 'Free shipping' : 'Standard shipping');
    params.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
    params.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(shipCents));
    params.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', CURRENCY);

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    const session = await res.json();
    if (!res.ok || !session.url) {
        console.log('stripe error:', session.error && session.error.message);
        return json(502, { error: 'stripe_error' });
    }

    return json(200, { url: session.url });
}
