// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
        const { plan_id, plan_name, amount, interval, currency } = await req.json()

        // @ts-ignore
        const razorpayKey = Deno.env.get('RAZORPAY_KEY_ID')
        // @ts-ignore
        const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

        if (!razorpayKey || !razorpaySecret) {
            throw new Error('Server configuration error: Missing Razorpay Keys')
        }

        console.log(`Using Razorpay Key: ${razorpayKey.substring(0, 8)}...`);
        console.log(`Requesting Plan ID: ${plan_id}`);

        const authHeader = `Basic ${btoa(`${razorpayKey}:${razorpaySecret}`)}`

        let razorpayPlanId = plan_id;

        // 1. If no plan_id provided, Create a Plan
        if (!razorpayPlanId) {
            const period = interval === 'year' ? 'yearly' : 'monthly';
            const razorpayInterval = interval === 'year' ? 1 : 1;
            const razorpayPeriod = interval === 'year' ? 'yearly' : 'monthly';

            const planRes = await fetch('https://api.razorpay.com/v1/plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify({
                    period: razorpayPeriod,
                    interval: razorpayInterval,
                    item: {
                        name: `Gainux ERP - ${plan_name}`,
                        amount: amount, // in paise
                        currency: currency,
                        description: `Subscription for ${plan_name} plan`
                    }
                })
            });

            const planData = await planRes.json();

            if (!planRes.ok) {
                console.error("Plan creation failed", planData);
                throw new Error(planData.error?.description || "Failed to create Plan");
            }

            razorpayPlanId = planData.id;
        }

        // 2. Create Subscription
        const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify({
                plan_id: razorpayPlanId,
                total_count: 100, // Roughly 8 years of monthly or 100 years. Razorpay requires total_count.
                quantity: 1,
                customer_notify: 1,
            })
        });

        const subData = await subRes.json();

        if (!subRes.ok) {
            console.error("Subscription creation failed", subData);
            throw new Error(subData.error?.description || "Failed to create Subscription");
        }

        return new Response(
            JSON.stringify({
                subscription_id: subData.id,
                plan_id: razorpayPlanId,
                success: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ success: false, message: error.message || 'Unknown error' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
