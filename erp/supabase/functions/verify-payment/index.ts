// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name, accept, origin, x-requested-with',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = payload;

        // @ts-ignore
        const secret = Deno.env.get('RAZORPAY_KEY_SECRET')

        if (!secret) {
            throw new Error('Server configuration error: Missing Secret')
        }

        // Verify Signature
        let body;
        if (razorpay_subscription_id) {
            // Subscription flow: payment_id + "|" + subscription_id
            body = razorpay_payment_id + "|" + razorpay_subscription_id;
        } else {
            // Order flow: order_id + "|" + payment_id
            body = razorpay_order_id + "|" + razorpay_payment_id;
        }

        // Node crypto in Deno
        const expectedSignature = createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            return new Response(
                JSON.stringify({ success: true, message: "Payment Verified" }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        } else {
            return new Response(
                JSON.stringify({ success: false, message: "Invalid Signature" }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
    } catch (error: any) {
        return new Response(
            JSON.stringify({ success: false, message: error.message || 'Unknown error' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
